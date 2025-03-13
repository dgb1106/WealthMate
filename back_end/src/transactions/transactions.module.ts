import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module'; 
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionDomainService } from './services/transaction-domain.service';


@Module({
  imports: [
    PrismaModule,
    CommonModule,
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    TransactionDomainService,
    {
      provide: PrismaTransactionRepository,
      useClass: PrismaTransactionRepository,
    }
    
  ],
  exports: [
    TransactionService,
  ]
})
export class TransactionsModule {}