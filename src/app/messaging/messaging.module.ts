import { Module } from '@nestjs/common';

import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';

@Module({
  providers: [KafkaProducerService, KafkaConsumerService],
})
export class MessagingModule {}
