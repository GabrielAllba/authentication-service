import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerRepository implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.client.emit(topic, message).toPromise();
      console.log(`✅ Sent message to topic [${topic}]`);
    } catch (error) {
      console.error('❌ Error sending Kafka message:', error);
      throw error;
    }
  }
}
