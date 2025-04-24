import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserReq } from '../dto/req/user/register-user.req';
import { RegisterUserRes } from '../dto/res/user/register-user.res';
import { UserUseCase } from '../usecase/register.usecase';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly UserUseCase: UserUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() dto: RegisterUserReq): Promise<RegisterUserRes> {
    return await this.UserUseCase.register(dto);
  }
}
