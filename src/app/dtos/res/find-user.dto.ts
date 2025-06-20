import { ApiProperty } from '@nestjs/swagger';

export class FindUserRes {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public username: string;

  @ApiProperty({ default: 'false' })
  public isEmailVerified: boolean;

  @ApiProperty({ default: 'false' })
  public isUserFirstTime: boolean;
}
