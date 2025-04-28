import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaProducerService } from '../../messaging/kafka/kafka-producer.service';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthUseCase } from './auth.usecase';
import { TokenModule } from '../tokens/token.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    TokenModule,
  ],
  providers: [AuthUseCase, KafkaProducerService],
  controllers: [AuthController],
})
export class AuthModule {}
