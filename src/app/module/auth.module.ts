import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { UserModule } from './user.module';
import { AuthUseCase } from '../usecase/auth.usecase';
import { AuthController } from '../controller/auth.controller';
import { GrpcController } from '../controller/grpc.controller';
import { TokenModule } from './token.module';

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
  exports: [AuthUseCase],
})
export class AuthModule {}
