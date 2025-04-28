import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaProducerService } from '../../messaging/kafka/kafka-producer.service';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthUseCase } from './auth.usecase';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  providers: [AuthUseCase, KafkaProducerService],
  controllers: [AuthController],
})
export class AuthModule {}
