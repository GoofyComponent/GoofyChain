import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  const originArray = process.env.CLIENT_URL?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: originArray,
    credentials: true,
  });

  app.use(cookieParser());

  // app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Wallets example')
    .setDescription('The Wallets API description')
    .setVersion('1.0')
    .addTag('wallets')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000);

  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);
  console.log(`🔑 Auth endpoints:`);
  console.log(`   POST ${url}/api/auth/register`);
  console.log(`   POST ${url}/api/auth/login`);
  console.log(`   GET ${url}/api/auth/profile`);
}

bootstrap();
