import { GetMeRes } from '../dto/res/get-me.dto';

export interface IUserUseCase {
  me(token: string): Promise<GetMeRes>;
}
