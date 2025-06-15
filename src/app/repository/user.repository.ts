import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async create(user: User): Promise<User> {
    const data = this.repository.create(user);
    return this.repository.save(data);
  }

  async updateVerificationToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(id, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    });
  }

  async markEmailAsVerified(id: string): Promise<void> {
    await this.repository.update(id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
  }

  async findByEmailOrUsernameLike(
    email?: string,
    username?: string,
  ): Promise<User[]> {
    const query = this.repository.createQueryBuilder('user');

    if (email) {
      query.orWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (username) {
      query.orWhere('user.username ILIKE :username', {
        username: `%${username}%`,
      });
    }

    return await query.getMany();
  }
}
