import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { AuthModule } from './app/auth/auth.module';
import { MessagingModule } from './infra/messaging.module';
import { UserModule } from './app/users/user.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    MessagingModule,
  ],
})
export class AppModule {}
