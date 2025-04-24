import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Authentication API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka-service:9092'],
      },
      consumer: {
        groupId: 'auth-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log(`🚀 Auth service running on http://localhost:3000`);
  console.log(`📚 Swagger docs available at http://localhost:3000/api`);
}
bootstrap();
