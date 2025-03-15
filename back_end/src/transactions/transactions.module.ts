import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionDomainService } from './services/transaction-domain.service';
import { UsersModule } from '../users/users.module';
import { DateUtilsService } from '../common/services/date-utils.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    PrismaTransactionRepository,
    TransactionDomainService,
    DateUtilsService
  ],
  exports: [TransactionService] // Đảm bảo TransactionService được export để các module khác có thể sử dụng
})
export class TransactionsModule {}