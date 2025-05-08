import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthUseCase } from './auth.usecase';
import { ValidateTokenReq } from './dto/req/validate-token';
import { ValidateTokenRes } from './dto/res/validate-token';

@Controller()
export class GrpcController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @GrpcMethod('ProjectHubAccountService', 'ValidateToken')
  async validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes> {
    console.log('[SERVER] gRPC ValidateToken called with token:', dto.token);
    return await this.authUseCase.validateToken(dto);
  }
}
