import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { TokenRepository } from './token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokenRepository],
  exports: [TokenRepository],
})
export class TokenModule {}
