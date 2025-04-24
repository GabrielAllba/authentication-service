import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { User } from './entity/user.entity';
import { RegisterUseCase } from './usecase/register.usecase';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KafkaModule],
  controllers: [AuthController],
  providers: [RegisterUseCase],
})
export class AuthModule {}
