import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '../tokens/token.repository';
import { UserRepository } from '../users/user.repository';
import { GetMeRes } from './dto/res/get-me.dto';

@Injectable()
export class UserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly tokenRepo: TokenRepository,
  ) {}

  async me(authHeader: string): Promise<GetMeRes> {
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization token format');
    }

    try {
      const existingToken = await this.tokenRepo.findByToken(token);
      if (!existingToken) {
        throw new UnauthorizedException('Token not found');
      }

      const currentTime = new Date();
      if (existingToken.expiresAt < currentTime) {
        throw new UnauthorizedException('Token has expired');
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
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
