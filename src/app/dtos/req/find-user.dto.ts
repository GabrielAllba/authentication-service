import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindUserReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
