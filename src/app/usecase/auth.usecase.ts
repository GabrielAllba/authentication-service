import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { FindUserReq } from '../dtos/req/find-user.dto';
import { LoginReq } from '../dtos/req/login.dto';
import { RegisterReq } from '../dtos/req/register.dto';
import { ValidateTokenReq } from '../dtos/req/validate-token';
import { FindUserRes } from '../dtos/res/find-user.dto';
import { LoginRes } from '../dtos/res/login.dto';
import { RegisterRes } from '../dtos/res/register.dto';
import { ValidateTokenRes } from '../dtos/res/validate-token';
import { TokenRepository } from '../repository/token.repository';
import { UserRepository } from '../repository/user.repository';
import { EmailUseCase } from './email.usecase';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtRepo: JwtService,
    private readonly tokenRepo: TokenRepository,
    private readonly emailUseCase: EmailUseCase,
  ) {}

  async register(dto: RegisterReq): Promise<RegisterRes> {
    const existingByEmail = await this.userRepo.findByEmail(dto.email);
    const existingByUsername = await this.userRepo.findByUsername(dto.username);

    if (existingByEmail) {
      if (
        existingByEmail.emailVerificationTokenExpiresAt &&
        existingByEmail.emailVerificationTokenExpiresAt < new Date()
      ) {
        const verificationToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.userRepo.updateVerificationToken(
          existingByEmail.id!,
          verificationToken,
          expiresAt,
        );

        try {
          await this.emailUseCase.sendVerificationEmail(
            existingByEmail.email,
            verificationToken,
          );
        } catch {
          throw new InternalServerErrorException(
            'Account found but failed to send verification email. Please try again later.',
          );
        }

        return {
          id: existingByEmail.id!,
          email: existingByEmail.email,
          username: existingByEmail.username,
          isEmailVerified: existingByEmail.isEmailVerified,
          isUserFirstTime: existingByEmail.isUserFirstTime,
        };
      }

      if (existingByEmail.isEmailVerified) {
        throw new ConflictException('Email already used & verified');
      }

      throw new ConflictException('Email already exists');
    }

    if (existingByUsername) {
      throw new ConflictException('Username already used');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    let user;
    try {
      user = await this.userRepo.create({
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: expiresAt,
        isUserFirstTime: true,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to create user account. Please try again.',
      );
    }

    try {
      await this.emailUseCase.sendVerificationEmail(
        user.email,
        verificationToken,
      );
    } catch {
      throw new InternalServerErrorException(
        'Account created successfully, but failed to send verification email. Please resend verification email or try again later.',
      );
    }

    return {
      id: user.id!,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      isUserFirstTime: user.isUserFirstTime,
    };
  }

  async login(dto: LoginReq): Promise<LoginRes> {
    let user = await this.userRepo.findByEmail(dto.identifier);

    if (!user) {
      user = await this.userRepo.findByUsername(dto.identifier);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        message: 'Email not verified yet',
        userId: user.id,
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtRepo.signAsync(payload, {
      expiresIn: '1h',
    });

    const decodedToken = await this.jwtRepo.decode(accessToken);
    const expiresAt = new Date(decodedToken.exp * 1000);

    await this.tokenRepo.create(accessToken, expiresAt);

    return { accessToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findByEmailVerificationToken(token);

    if (!user) {
      throw new BadRequestException(
        'Verification Token not found or already expired. Please login or register again.',
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification token not found or already expired. Please login or register again',
      );
    }

    await this.userRepo.markEmailAsVerified(user.id!);
  }

  async logout(token: string): Promise<void> {
    try {
      const tokenInDb = token.split(' ')[1];
      if (!tokenInDb) {
        throw new UnauthorizedException('Invalid authorization token format');
      }
      const existingToken = await this.tokenRepo.findByToken(tokenInDb);
      if (!existingToken) {
        throw new UnauthorizedException(
          'Token not found or already logged out.',
        );
      }
      await this.tokenRepo.remove(tokenInDb);
    } catch (error) {
      throw new UnauthorizedException(
        'Logout failed due to an unexpected error: ' + error,
      );
    }
  }

  async validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes> {
    if (!dto.token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const token = dto.token.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization token format');
    }

    try {
      const existingToken = await this.tokenRepo.findByToken(token);
      if (!existingToken) {
        throw new UnauthorizedException('Token not found');
      }

      const currentTime = new Date();
      if (existingToken.expiresAt < currentTime) {
        throw new UnauthorizedException('Token has expired');
      }

      const decoded = await this.jwtRepo.verifyAsync(token);
      const userId = decoded.sub;

      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        userId: user.id!,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token' + error);
    }
  }

  async findUser(dto: FindUserReq): Promise<FindUserRes> {
    try {
      const user = await this.userRepo.findById(dto.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        id: user.id!,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        isUserFirstTime: user.isUserFirstTime,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired token' + error);
    }
  }

  async searchUsers(query: string): Promise<FindUserRes[]> {
    const users = await this.userRepo.findByEmailOrUsernameLike(query, query);

    return users.map((user) => ({
      id: user.id!,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      isUserFirstTime: user.isUserFirstTime,
    }));
  }

  async resendVerificationEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      let verificationToken = user.emailVerificationToken;
      if (
        !verificationToken ||
        user.emailVerificationTokenExpiresAt! < new Date()
      ) {
        verificationToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.userRepo.updateVerificationToken(
          user.id!,
          verificationToken,
          expiresAt,
        );
      }

      await this.emailUseCase.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to send verification email. Please try again later.',
      );
    }
  }

  async updateNotFirstUser(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isUserFirstTime === true) {
      await this.userRepo.updateIsUserFirstTimeStatus(user.id!, false);
    }
  }

  async findUserByEmail(email: string): Promise<FindUserRes> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id!,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      isUserFirstTime: user.isUserFirstTime,
    };
  }
}
