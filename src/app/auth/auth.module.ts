import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { UserModule } from '../module/user.module';
import { AuthUseCase } from '../usecase/auth.usecase';
import { TokenModule } from '../module/token.module';
import { GrpcController } from '../controller/grpc.controller';
import { AuthController } from '../controller/auth.controller';

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
