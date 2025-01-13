import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);

  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);
  console.log(`🔑 Auth endpoints:`);
  console.log(`   POST ${url}/api/auth/register`);
  console.log(`   POST ${url}/api/auth/login`);
  console.log(`   GET ${url}/api/auth/profile`);
}

bootstrap();
