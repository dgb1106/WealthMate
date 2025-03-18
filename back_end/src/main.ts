import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/serializer/bigint.serializer';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('WealthMate API')
    .setDescription('Hệ thống quản lý tài chính cá nhân và gia đình WealthMate')
    .setVersion('1.0')
    .addTag('auth', 'Xác thực người dùng')
    .addTag('users', 'Quản lý người dùng')
    .addTag('transactions', 'Quản lý giao dịch')
    .addTag('categories', 'Quản lý danh mục')
    .addTag('budgets', 'Quản lý ngân sách')
    .addTag('reports', 'Báo cáo tài chính')
    .addTag('goals', 'Mục tiêu tài chính cá nhân')
    .addTag('recurring-transactions', 'Giao dịch định kỳ')
    .addTag('loans', 'Quản lý khoản vay')
    .addTag('family-groups', 'Quản lý nhóm gia đình')
    .addTag('family-members', 'Quản lý thành viên gia đình')
    .addTag('family-invitations', 'Quản lý danh mục gia đình')
    .addTag('family-budgets', 'Quản lý ngân sách gia đình')
    .addTag('family-goals', 'Quản lý mục tiêu tài chính của gia đình')
    .addTag('family-transaction-contribution', 'Quản lý đóng góp giao dịch cho gia đình')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();