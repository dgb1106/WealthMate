import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiUtilsController } from './ai-utils.controller';
import { AiUtilsService } from './ai-utils.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AiUtilsController],
  providers: [AiUtilsService]
})
export class AiUtilsModule {}
