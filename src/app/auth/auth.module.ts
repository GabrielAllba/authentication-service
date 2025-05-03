import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from 'src/messaging/kafka/kafka.module';
import { TokenModule } from '../tokens/token.module';
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
    TokenModule,
    KafkaModule,
  ],
  providers: [AuthUseCase],
  controllers: [AuthController],
})
export class AuthModule {}
