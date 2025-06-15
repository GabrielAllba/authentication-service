import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FindUserReq } from '../dtos/req/find-user.dto';
import { LoginReq } from '../dtos/req/login.dto';
import { RegisterReq } from '../dtos/req/register.dto';
import { FindUserRes } from '../dtos/res/find-user.dto';
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

  @Get('validate_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate Login Token' })
  @ApiResponse({
    status: 200,
    description: 'Login token validation',
  })
  async validateToken(
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    await this.authUseCase.validateToken({ token: authHeader });
    return { message: 'Success' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged in user' })
  @ApiResponse({
    status: 200,
    description: 'Get logged in user',
  })
  async me(@Headers('authorization') authHeader: string): Promise<FindUserRes> {
    const user = await this.authUseCase.validateToken({ token: authHeader });
    const res = await this.authUseCase.findUser({ id: user.userId });
    return res;
  }

  @Post('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find user' })
  @ApiResponse({
    status: 200,
    description: 'Find user',
    type: FindUserRes,
  })
  async findUser(@Body() dto: FindUserReq): Promise<FindUserRes> {
    return await this.authUseCase.findUser(dto);
  }

  @Get('search-users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by username or email' })
  @ApiQuery({ name: 'query' })
  @ApiResponse({
    status: 200,
    description: 'List of matching users',
  })
  async searchUsers(@Query('query') query: string): Promise<FindUserRes[]> {
    return await this.authUseCase.searchUsers(query);
  }
}
