import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { MessagingModule } from './app/messaging/messaging.module';
import { AuthModule } from './app/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, MessagingModule],
})
export class AppModule {}
