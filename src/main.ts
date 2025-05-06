import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.PROJECT_HUB_ACCOUNT_SERVICE_GRPC_PORT}`,
        package: 'projecthubaccountservice',
        protoPath: join(
          __dirname,
          '..',
          '..',
          'proto-shared',
          'project-hub-account-service.proto',
        ),
      },
    },
  );

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Project Hub Account Service')
    .setDescription('Account API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(
    `🚀Project Hub Account service running on http://localhost:${process.env.PORT || 3000}`,
  );
  console.log(
    `📚 Swagger docs available at http://localhost:${process.env.PORT || 3000}/api`,
  );

  await grpcApp.listen();
  console.log(
    `✅ Project Hub Account Service gRPC service running on port ${process.env.PROJECT_HUB_ACCOUNT_SERVICE_GRPC_PORT || 50051}`,
  );
}
bootstrap();
