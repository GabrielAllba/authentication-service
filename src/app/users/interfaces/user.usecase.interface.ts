import { GetMeReq } from '../dto/req/get-me.dto';
import { GetMeRes } from '../dto/res/get-me.dto';

export interface IUserUseCase {
  me(dto: GetMeReq): Promise<GetMeRes>;
}
