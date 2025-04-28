import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '../tokens/token.module';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserUseCase } from './user.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TokenModule,
  ],
  providers: [UserUseCase, UserRepository],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UserModule {}
