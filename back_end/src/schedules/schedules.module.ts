import { Module } from '@nestjs/common';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { JwtTokensScheduler } from './JwtTokens';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringTransactionsModule } from '../recurring-transactions/recurring-transactions.module';

@Module({
  imports: [
    PrismaModule,
    RecurringTransactionsModule
  ],
  providers: [
    RecurringTransactionsScheduler,
    JwtTokensScheduler
  ],
})
export class SchedulesModule {}
