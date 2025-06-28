import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailUseCase } from '../usecase/email.usecase';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.EMAIL_SERVICE_URL,
          package: 'emailservice',
          protoPath: '../contract/email-service.proto',
        },
      },
    ]),
  ],
  providers: [EmailUseCase],
  exports: [EmailUseCase],
})
export class EmailModule {}
