import { RegisterUserReq } from 'src/app/dto/req/user/register-user.req';
import { User } from 'src/app/entity/user.entity';

export interface IUserRepository {
  create(data: RegisterUserReq): Promise<User>;
}
