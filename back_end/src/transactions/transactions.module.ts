import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './services/transaction.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionDomainService } from './services/transaction-domain.service';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    TransactionDomainService,
    {
      provide: 'TRANSACTION_REPOSITORY',
      useClass: PrismaTransactionRepository,
    }
  ],
  exports: [TransactionService],
})
export class TransactionsModule {}
