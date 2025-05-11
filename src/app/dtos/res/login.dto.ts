import { ApiProperty } from '@nestjs/swagger';

export class LoginRes {
  @ApiProperty()
  accessToken: string;
}
