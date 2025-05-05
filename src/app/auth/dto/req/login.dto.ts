import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginReq {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
