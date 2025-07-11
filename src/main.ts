import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BaseResponseInterceptor } from './interceptor/response-mapping.interceptor';
import { BaseExceptionsFilter } from './filter/base-exception.filter';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.PROJECT_HUB_ACCOUNT_SERVICE_GRPC_PORT}`,
        package: 'authenticationservice',
        protoPath: './contract/authentication-service.proto',
      },
    },
  );

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost',
      'http://20.169.219.62',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new BaseExceptionsFilter());
  app.useGlobalInterceptors(new BaseResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Authentication Service API')
    .setDescription('Account API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await grpcApp.listen();
  console.log(
    `✅ Authentication Service gRPC service running on port ${process.env.PROJECT_HUB_ACCOUNT_SERVICE_GRPC_PORT || 50051}`,
  );

  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀Authentication service running on http://localhost:${process.env.PORT || 3000}`,
  );
  console.log(
    `📚 Swagger docs available at http://localhost:${process.env.PORT || 3000}/api`,
  );
}
bootstrap();
