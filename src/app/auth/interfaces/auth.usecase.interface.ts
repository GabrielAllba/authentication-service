import { LoginReq } from '../dto/req/login.dto';
import { LogoutReq } from '../dto/req/logout.dto';
import { RegisterReq } from '../dto/req/register.dto';
import { ValidateTokenReq } from '../dto/req/validate-token.dto';
import { VerifyEmailReq } from '../dto/req/verify-email.dto';
import { LoginRes } from '../dto/res/login.dto';
import { LogoutRes } from '../dto/res/logout';
import { RegisterRes } from '../dto/res/register.dto';
import { ValidateTokenRes } from '../dto/res/validate-token.dto';
import { VerifyEmailRes } from '../dto/res/verify-email.dto';

export interface IAuthUseCase {
  register(dto: RegisterReq): Promise<RegisterRes>;
  login(dto: LoginReq): Promise<LoginRes>;
  verifyEmail(dto: VerifyEmailReq): Promise<VerifyEmailRes>;
  logout(dto: LogoutReq): Promise<LogoutRes>;
  validateToken(dto: ValidateTokenReq): Promise<ValidateTokenRes>;
}
