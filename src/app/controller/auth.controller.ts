import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoginReq } from '../dtos/req/login.dto';
import { RegisterReq } from '../dtos/req/register.dto';
import { LoginRes } from '../dtos/res/login.dto';
import { RegisterRes } from '../dtos/res/register.dto';
import { AuthUseCase } from '../usecase/auth.usecase';

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

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email using token' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    await this.authUseCase.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Get('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (invalidate token client-side)' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  async logout(
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    await this.authUseCase.logout(authHeader);
    return { message: 'Successfully logged out' };
  }
}
