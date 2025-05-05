import { IsString } from 'class-validator';

export class LogoutReq {
  @IsString()
  token: string;
}
