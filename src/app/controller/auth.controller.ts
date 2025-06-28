import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
import { ResendVerificationReq } from '../dtos/req/resend-verification.dto';

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

  @Put('not-first-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user to be not a first user' })
  @ApiResponse({
    status: 200,
    description: 'User updated to be not a first user',
  })
  async updateNotFirstUser(
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    const validatedUser = await this.authUseCase.validateToken({
      token: authHeader,
    });
    await this.authUseCase.updateNotFirstUser(validatedUser.userId);
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

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email for unverified user' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already verified',
  })
  async resendVerification(
    @Body() dto: ResendVerificationReq,
  ): Promise<{ message: string }> {
    await this.authUseCase.resendVerificationEmail(dto.email);
    return { message: 'Verification email has been resent' };
  }

  @Get('find-by-email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find user by email' })
  @ApiQuery({ name: 'email', type: String })
  @ApiResponse({
    status: 200,
    description: 'User found by email',
    type: FindUserRes,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findUserByEmail(@Query('email') email: string): Promise<FindUserRes> {
    return await this.authUseCase.findUserByEmail(email);
  }
}
