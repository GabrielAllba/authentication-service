import { Controller, Get, Headers } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetMeRes } from './dto/res/get-me.dto';
import { UserUseCase } from './user.usecase';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user details',
    type: GetMeRes,
  })
  async me(@Headers('authorization') authHeader: string): Promise<GetMeRes> {
    const getMe = this.userUseCase.me(authHeader);
    return getMe;
  }
}
