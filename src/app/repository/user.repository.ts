import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { IUserRepository } from '../interface/repository/user.repository.interface';
import { RegisterUserReq } from '../dto/req/user/register-user.req';

export class UserRepository implements IUserRepository {
  constructor(private readonly userRepo: Repository<User>) {}

  create(user: RegisterUserReq): Promise<User> {
    return this.userRepo.save(user);
  }
}
