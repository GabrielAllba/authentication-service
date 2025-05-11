import { ApiProperty } from '@nestjs/swagger';

export class GetMeRes {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public username: string;

  @ApiProperty({ default: 'false' })
  public isEmailVerified: boolean;
}
