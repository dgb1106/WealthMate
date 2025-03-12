import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/bigint.serializer';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

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
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();