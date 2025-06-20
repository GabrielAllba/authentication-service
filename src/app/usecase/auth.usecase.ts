import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { KafkaProducerRepository } from 'src/infra/kafka/kafka-producer.repository';
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

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly kafkaProducerRepo: KafkaProducerRepository,
    private readonly jwtRepo: JwtService,
    private readonly tokenRepo: TokenRepository,
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

        await this.kafkaProducerRepo.sendMessage('user.created', {
          email: existingByEmail.email,
          emailVerificationToken: verificationToken,
        });

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

    const user = await this.userRepo.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
      isUserFirstTime: true,
    });

    await this.userRepo.create(user);

    await this.kafkaProducerRepo.sendMessage('user.created', {
      email: user.email,
      emailVerificationToken: verificationToken,
    });

    return {
      id: user.id!,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      isUserFirstTime: user.isUserFirstTime,
    };
  }

  async login(dto: LoginReq): Promise<LoginRes> {
    // Try to find the user by email first
    let user = await this.userRepo.findByEmail(dto.identifier);

    // If not found by email, try by username
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
  // src/auth/usecase/auth.usecase.ts
  async resendVerificationEmail(email: string): Promise<void> {
    const existingUser = await this.userRepo.findByEmail(email);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If token expired → generate a new one
    if (
      existingUser.emailVerificationTokenExpiresAt &&
      existingUser.emailVerificationTokenExpiresAt < new Date()
    ) {
      const verificationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.userRepo.updateVerificationToken(
        existingUser.id!,
        verificationToken,
        expiresAt,
      );

      await this.kafkaProducerRepo.sendMessage('user.created', {
        email: existingUser.email,
        emailVerificationToken: verificationToken,
      });

      return;
    }

    // If already verified → don't resend
    if (existingUser.isEmailVerified) {
      throw new ConflictException('Email is already verified');
    }

    // If not expired yet → resend same token
    await this.kafkaProducerRepo.sendMessage('user.created', {
      email: existingUser.email,
      emailVerificationToken: existingUser.emailVerificationToken,
    });
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
}
