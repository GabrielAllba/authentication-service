import { LoginReq } from '../dto/req/login.dto';
import { RegisterReq } from '../dto/req/register.dto';
import { LoginRes } from '../dto/res/login.dto';
import { RegisterRes } from '../dto/res/register.dto';

export interface IAuthUseCase {
  register(data: RegisterReq): Promise<RegisterRes>;
  login(data: LoginReq): Promise<LoginRes>;
  verifyEmail(token: string): Promise<void>;
  logout(authHeader: string): Promise<void>;
}
