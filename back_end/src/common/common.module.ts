import { Module } from '@nestjs/common';
import { DateUtilsService } from './services/date-utils.service';

@Module({
  providers: [DateUtilsService],
  exports: [DateUtilsService],
})
export class CommonModule {}
