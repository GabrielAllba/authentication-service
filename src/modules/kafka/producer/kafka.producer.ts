import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async emitEmailEvent(payload: { email: string; name: string }) {
    await this.producer.send({
      topic: 'email-verification',
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
