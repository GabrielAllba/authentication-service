import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthUseCase } from 'src/app/usecase/auth.usecase';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authUseCase: AuthUseCase) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }

    try {
      await this.authUseCase.validateToken({
        token: authHeader,
      });

      next();
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }
}
