import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/serializer/bigint.serializer';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:8080',
      'https://wealthmate.onrender.com', 
      'https://wealth-mate-eight.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new BigIntSerializerInterceptor(reflector));

  const config = new DocumentBuilder()
    .setTitle('WealthMate API')
    .setDescription('API quản lý tài chính cá nhân')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('transactions')
    .addTag('categories')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();