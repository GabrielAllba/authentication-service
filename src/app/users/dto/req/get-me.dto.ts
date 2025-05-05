import { IsString } from 'class-validator';

export class GetMeReq {
  @IsString()
  token: string;
}
