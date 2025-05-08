import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { KafkaProducerRepository } from 'src/infra/kafka/kafka-producer.repository';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../tokens/token.repository';
import { UserRepository } from '../users/user.repository';
import { LoginReq } from './dto/req/login.dto';
import { RegisterReq } from './dto/req/register.dto';
import { LoginRes } from './dto/res/login.dto';
import { RegisterRes } from './dto/res/register.dto';
import { IAuthUseCase } from './interfaces/auth.usecase.interface';
import { ValidateTokenReq } from './dto/req/validate-token';
import { ValidateTokenRes } from './dto/res/validate-token';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly kafkaProducerRepo: KafkaProducerRepository,
    private readonly jwtRepo: JwtService,
    private readonly tokenRepo: TokenRepository,
  ) {}

  async register(dto: RegisterReq): Promise<RegisterRes> {
    const existingByEmail = await this.userRepo.findByEmail(dto.email);
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
        };
      }

      if (existingByEmail.isEmailVerified) {
        throw new ConflictException('Email already verified');
      }

      throw new ConflictException('Email already exists');
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
    };
  }

  async login(dto: LoginReq): Promise<LoginRes> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified yet');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please register again.',
      );
    }

    await this.userRepo.markEmailAsVerified(user.id!);
  }

  async logout(token: string): Promise<void> {
    const tokenInDb = token.split(' ')[1];
    const existingToken = await this.tokenRepo.findByToken(tokenInDb);
    if (!existingToken) {
      throw new UnauthorizedException('Token not found or already logged out.');
    }

    await this.tokenRepo.remove(tokenInDb);
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
        id: user.id!,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
