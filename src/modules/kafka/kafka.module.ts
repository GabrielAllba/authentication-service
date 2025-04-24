import { Module } from '@nestjs/common';
import { KafkaConsumer } from './consumer/kafka.consumer';
import { KafkaProducer } from './producer/kafka.producer';

@Module({
  providers: [KafkaProducer, KafkaConsumer],
  exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}
