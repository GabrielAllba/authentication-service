import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
