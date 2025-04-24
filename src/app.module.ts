import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { AuthModule } from './app/auth.module';
import { KafkaModule } from './app/kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, KafkaModule],
})
export class AppModule {}
