import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { User } from './entity/user.entity';
import { KafkaModule } from './kafka/kafka.module';
import { UserUseCase } from './usecase/register.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KafkaModule],
  controllers: [AuthController],
  providers: [UserUseCase],
})
export class AuthModule {}
