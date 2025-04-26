import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KafkaProducerService } from '../messaging/kafka/kafka-producer.service';
import { User } from '../users/interfaces/user.interface';
import { RegisterReq } from './dto/req/register.dto';
import { RegisterRes } from './dto/res/register.dto';
import { IAuthUseCase } from './interfaces/auth.usecase.interface';
import { LoginReq } from './dto/req/login.dto';
import { LoginRes } from './dto/res/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterReq): Promise<RegisterRes> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userEntity = this.userRepo.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });
    const user = await this.userRepo.save(userEntity);

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
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

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
