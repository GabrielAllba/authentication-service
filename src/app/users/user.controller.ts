import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserUseCase } from './user.usecase';
import { GetMeRes } from './dto/res/get-me.dto';
import { GetMeReq } from './dto/req/get-me.dto';

@Controller()
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @GrpcMethod('AuthService', 'GetMe')
  async me(dto: GetMeReq): Promise<GetMeRes> {
    return this.userUseCase.me(dto);
  }
}
