import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './services/transaction.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionRepository} from './repositories/transaction-repository.interface';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionDomainService } from './services/transaction-domain.service';


@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    TransactionDomainService,
    TransactionService,
  ],
  exports: [
    TransactionService, 
    TransactionDomainService,
    TransactionService
  ]
})
export class TransactionsModule {}
