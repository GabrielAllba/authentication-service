import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class KafkaConsumer {
  private readonly logger = new Logger(KafkaConsumer.name);

  @MessagePattern('email-verification')
  handleEmail(@Payload() message: { value: { email: string; name: string } }) {
    this.logger.log(
      `✅ Welcome email sent to ${message.value.email} (${message.value.name})`,
    );
  }
}
