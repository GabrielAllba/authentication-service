import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaProducer } from 'src/app/kafka/producer/kafka.producer';
import { RegisterUserReq } from '../dto/req/user/register-user.req';
import { User } from '../entity/user.entity';
import { IUserUseCase } from '../interface/usecase/user.usecase.interface';
import { UserRepository } from '../repository/user.repository';
import { RegisterUserRes } from '../dto/res/user/register-user.res';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
    private readonly kafkaproducer: KafkaProducer,
  ) {}

  async register(dto: RegisterUserReq): Promise<RegisterUserRes> {
    const user = await this.userRepo.create(dto);
    await this.kafkaproducer.emitEmailEvent({
      email: user.email,
      username: user.username,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
      },
    };
  }
}
