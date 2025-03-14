import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module'; 
import { UsersModule } from 'src/users/users.module';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TransactionDomainService } from './services/transaction-domain.service';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/users.entity';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    UsersModule,
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    TransactionDomainService,
    {
      provide: PrismaTransactionRepository,
      useClass: PrismaTransactionRepository,
    },
  ],
  exports: [
    TransactionService,
  ]
})
export class TransactionsModule {}