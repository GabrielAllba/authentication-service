import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ValidateTokenReq } from '../dtos/req/validate-token';
import { ValidateTokenRes } from '../dtos/res/validate-token';
import { AuthUseCase } from '../usecase/auth.usecase';
import { FindUserReq } from '../dtos/req/find-user.dto';
import { FindUserRes } from '../dtos/res/find-user.dto';

@Controller()
export class GrpcController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @GrpcMethod('AuthenticationService', 'ValidateToken')
  async validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes> {
    return await this.authUseCase.validateToken(dto);
  }

  @GrpcMethod('AuthenticationService', 'FindUser')
  async findUser(dto: FindUserReq): Promise<FindUserRes> {
    return await this.authUseCase.findUser(dto);
  }
}
