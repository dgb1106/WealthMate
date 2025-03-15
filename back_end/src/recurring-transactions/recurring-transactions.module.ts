import { Module } from '@nestjs/common';
import { RecurringTransactionController } from './recurring-transactions.controller';
import { RecurringTransactionService } from './recurring-transactions.service';
import { RecurringTransactionDomainService } from './services/recurring-transaction-domain.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module'; 
import { PrismaRecurringTransactionRepository } from './repositories/prisma-recurring-transaction.repository';

@Module({
  imports: [
    PrismaModule,
    CommonModule 
  ],
  controllers: [RecurringTransactionController],
  providers: [
    RecurringTransactionService,
    RecurringTransactionDomainService,
    PrismaRecurringTransactionRepository,
    {
      provide: 'RecurringTransactionRepository',
      useExisting: PrismaRecurringTransactionRepository
    }
  ],
  exports: [RecurringTransactionService]
})
export class RecurringTransactionsModule {}
