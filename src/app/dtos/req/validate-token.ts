import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTokenReq {
  @IsString()
  @IsNotEmpty()
  token: string;
}
