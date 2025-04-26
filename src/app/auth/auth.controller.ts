import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUseCase } from './auth.usecase';
import { RegisterReq } from './dto/req/register.dto';
import { RegisterRes } from './dto/res/register.dto';
import { LoginRes } from './dto/res/login.dto';
import { LoginReq } from './dto/req/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterRes,
  })
  async register(@Body() dto: RegisterReq): Promise<RegisterRes> {
    const user = await this.authUseCase.register(dto);
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginRes,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(@Body() dto: LoginReq): Promise<LoginRes> {
    const result = await this.authUseCase.login(dto);
    return result;
  }
}
