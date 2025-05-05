import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserReq {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  username: string;
}
