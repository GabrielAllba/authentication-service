import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Token } from '../entity/token.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async cleanExpiredTokens() {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
