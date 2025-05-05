import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerRepository } from './kafka-producer.repository';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'CLIENT_PROJECT_HUB_ACCOUNT_SERVICE',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerRepository],
  exports: [KafkaProducerRepository],
})
export class KafkaModule {}
