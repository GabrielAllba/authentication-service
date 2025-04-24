import { RegisterDto } from '../dto/register.dto';
import { User } from '../entity/user.entity';

export interface IAuthService {
  register(data: RegisterDto): Promise<User>;
}
