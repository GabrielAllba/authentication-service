import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaProducer } from 'src/modules/kafka/producer/kafka.producer';
import { Repository } from 'typeorm';
import { RegisterDto } from '../dto/register.dto';
import { User } from '../entity/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly kafkaproducer: KafkaProducer,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const user = this.userRepo.create(dto);
    await this.userRepo.save(user);
    await this.kafkaproducer.emitEmailEvent({
      email: user.email,
      name: user.name,
    });
    return user;
  }
}
