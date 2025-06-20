import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationReq {
  @ApiProperty()
  @IsEmail()
  email: string;
}
