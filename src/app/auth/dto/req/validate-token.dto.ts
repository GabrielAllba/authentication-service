import { IsString } from 'class-validator';

export class ValidateTokenReq {
  @IsString()
  token: string;
}
