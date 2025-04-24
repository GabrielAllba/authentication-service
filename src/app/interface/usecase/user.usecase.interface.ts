import { RegisterUserReq } from 'src/app/dto/req/user/register-user.req';
import { RegisterUserRes } from 'src/app/dto/res/user/register-user.res';

export interface IUserUseCase {
  register(data: RegisterUserReq): Promise<RegisterUserRes>;
}
