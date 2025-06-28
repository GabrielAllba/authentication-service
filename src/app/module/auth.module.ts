import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controller/auth.controller';
import { GrpcController } from '../controller/grpc.controller';
import { AuthUseCase } from '../usecase/auth.usecase';
import { TokenModule } from './token.module';
import { UserModule } from './user.module';
import { EmailModule } from './email.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    TokenModule,
    EmailModule,
  ],
  providers: [AuthUseCase],
  controllers: [AuthController, GrpcController],
  exports: [AuthUseCase],
})
export class AuthModule {}
