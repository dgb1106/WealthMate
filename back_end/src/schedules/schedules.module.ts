import { Module } from '@nestjs/common';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { JwtTokensScheduler } from './JwtTokens';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringTransactionsModule } from '../recurring-transactions/recurring-transactions.module';
import { BudgetsScheduler } from './budgets.scheduler';
import { BudgetsModule } from 'src/budgets/budgets.module';

@Module({
  imports: [
    PrismaModule,
    RecurringTransactionsModule,
    BudgetsModule,
  ],
  providers: [
    RecurringTransactionsScheduler,
    JwtTokensScheduler,
    BudgetsScheduler,
  ],
})
export class SchedulesModule {}
