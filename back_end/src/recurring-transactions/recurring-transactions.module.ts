import { Module } from '@nestjs/common';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Module({
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService]
})
export class RecurringTransactionsModule {}
