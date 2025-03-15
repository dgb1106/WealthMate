import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionDomainService } from './services/transaction-domain.service';
import { UsersModule } from '../users/users.module';
import { DateUtilsService } from '../common/services/date-utils.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { BudgetsModule } from 'src/budgets/budgets.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    BudgetsModule,
    CategoriesModule,
    CacheModule.register(),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    PrismaTransactionRepository,
    TransactionDomainService,
    DateUtilsService
  ],
  exports: [TransactionService]
})
export class TransactionsModule {}