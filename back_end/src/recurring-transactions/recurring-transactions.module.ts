import { Module } from '@nestjs/common';
import { RecurringTransactionController } from './recurring-transactions.controller';
import { RecurringTransactionService } from './recurring-transactions.service';
import { RecurringTransactionDomainService } from './services/recurring-transaction-domain.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaRecurringTransactionRepository } from './repositories/prisma-recurring-transaction.repository';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    TransactionsModule // Thêm TransactionsModule để có thể inject TransactionService
  ],
  controllers: [RecurringTransactionController],
  providers: [
    RecurringTransactionService,
    RecurringTransactionDomainService,
    {
      provide: 'RecurringTransactionRepository',
      useClass: PrismaRecurringTransactionRepository,
    },
  ],
  exports: [RecurringTransactionService, RecurringTransactionDomainService]
})
export class RecurringTransactionsModule {}
