import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/token.entity';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private readonly repository: Repository<Token>,
  ) {}

  async create(token: string, expiresAt: Date): Promise<Token> {
    const blacklistedToken = this.repository.create({ token, expiresAt });
    return this.repository.save(blacklistedToken);
  }

  async exists(token: string): Promise<boolean> {
    const result = await this.repository.findOne({ where: { token } });
    return !!result;
  }

  async remove(token: string): Promise<void> {
    const result = await this.repository.delete({ token });
    if (result.affected === 0) {
      throw new Error('Token not found in blacklist');
    }
  }
  async findByToken(token: string): Promise<Token | null> {
    return this.repository.findOne({ where: { token } });
  }
}
