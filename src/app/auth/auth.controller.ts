import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthUseCase } from './auth.usecase';
import { LoginReq } from './dto/req/login.dto';
import { LogoutReq } from './dto/req/logout.dto';
import { RegisterReq } from './dto/req/register.dto';
import { ValidateTokenReq } from './dto/req/validate-token.dto';
import { VerifyEmailReq } from './dto/req/verify-email.dto';
import { LoginRes } from './dto/res/login.dto';
import { LogoutRes } from './dto/res/logout';
import { RegisterRes } from './dto/res/register.dto';
import { ValidateTokenRes } from './dto/res/validate-token.dto';
import { VerifyEmailRes } from './dto/res/verify-email.dto';

@Controller()
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @GrpcMethod('AuthService', 'Register')
  async register(dto: RegisterReq): Promise<RegisterRes> {
    return this.authUseCase.register(dto);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(dto: LoginReq): Promise<LoginRes> {
    return this.authUseCase.login(dto);
  }

  @GrpcMethod('AuthService', 'VerifyEmail')
  async verifyEmail(dto: VerifyEmailReq): Promise<VerifyEmailRes> {
    return this.authUseCase.verifyEmail(dto);
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(dto: LogoutReq): Promise<LogoutRes> {
    return this.authUseCase.logout(dto);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes> {
    return this.authUseCase.validateToken(dto);
  }
}
