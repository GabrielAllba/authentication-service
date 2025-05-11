import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ValidateTokenReq } from '../dtos/req/validate-token';
import { ValidateTokenRes } from '../dtos/res/validate-token';
import { AuthUseCase } from '../usecase/auth.usecase';

@Controller()
export class GrpcController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @GrpcMethod('AuthenticationService', 'ValidateToken')
  async validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes> {
    return await this.authUseCase.validateToken(dto);
  }
}
