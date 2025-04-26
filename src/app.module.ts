import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { AuthModule } from './app/auth/auth.module';
import { MessagingModule } from './app/messaging/messaging.module';
import { UserModule } from './app/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UserModule,
    MessagingModule,
  ],
})
export class AppModule {}
