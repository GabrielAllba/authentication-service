import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailReq {
  @IsEmail()
  @IsNotEmpty()
  token: string;
}
