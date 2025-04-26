import { Module } from '@nestjs/common';

import { KafkaProducerService } from './kafka/kafka-producer.service';

@Module({
  providers: [KafkaProducerService],
})
export class MessagingModule {}
