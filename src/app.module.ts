import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { KafkaModule } from './modules/kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), KafkaModule, AuthModule],
})
export class AppModule {}
