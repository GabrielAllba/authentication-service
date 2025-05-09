import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenRes {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  isEmailVerified: boolean;
}
