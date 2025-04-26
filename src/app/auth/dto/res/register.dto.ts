import { ApiProperty } from '@nestjs/swagger';

export class RegisterRes {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public username: string;
}
