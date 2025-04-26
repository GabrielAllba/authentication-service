import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { KafkaProducerService } from '../messaging/kafka/kafka-producer.service';
import { UserRepository } from '../users/user.repository';
import { LoginReq } from './dto/req/login.dto';
import { RegisterReq } from './dto/req/register.dto';
import { LoginRes } from './dto/res/login.dto';
import { RegisterRes } from './dto/res/register.dto';
import { IAuthUseCase } from './interfaces/auth.usecase.interface';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterReq): Promise<RegisterRes> {
    const existingByEmail = await this.userRepo.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingByUsername = await this.userRepo.findByUsername(dto.username);
    if (existingByUsername) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });

    await this.kafkaProducerService.sendMessage('user.created', {
      id: user.id,
      email: user.email,
      username: user.username,
    });
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
  async login(dto: LoginReq): Promise<LoginRes> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
