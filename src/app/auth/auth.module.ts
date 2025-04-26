import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaProducerService } from '../messaging/kafka/kafka-producer.service';
import { User } from '../users/interfaces/user.interface';
import { AuthController } from './auth.controller';
import { AuthUseCase } from './auth.usecase';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthUseCase, KafkaProducerService],
  controllers: [AuthController],
})
export class AuthModule {}
