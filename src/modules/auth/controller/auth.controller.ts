import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterUseCase } from '../usecase/register.usecase';
import { StandardResponse } from 'src/common/dto/standard-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() dto: RegisterDto): Promise<StandardResponse<any>> {
    const result = await this.registerUseCase.execute(dto);

    return new StandardResponse(
      {
        error_code: '00',
        error_message: {
          indonesia: 'Registrasi berhasil',
          english: 'Registration successful',
        },
      },
      result,
    );
  }
}
