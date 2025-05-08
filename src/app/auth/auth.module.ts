import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { TokenModule } from '../tokens/token.module';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthUseCase } from './auth.usecase';
import { GrpcController } from './grpc.controller';

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
  controllers: [AuthController, GrpcController],
})
export class AuthModule {}
