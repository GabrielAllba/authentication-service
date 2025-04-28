import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/user.repository';
import { IUserUseCase } from './interfaces/user.usecase.interface';
import { GetMeRes } from './dto/res/get-me.dto';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async me(authHeader: string): Promise<GetMeRes> {
    try {
      if (!authHeader) {
        throw new UnauthorizedException('Authorization token is missing');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Invalid authorization token format');
      }

      const decoded = await this.jwtService.verifyAsync(token);

      const userId = decoded.sub;

      const user = await this.userRepo.findById(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id!,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
