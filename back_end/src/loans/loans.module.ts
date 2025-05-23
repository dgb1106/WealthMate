import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaLoanRepository } from './repositories/prisma-loans.repository';
import { LoanRepository } from './repositories/loans-repository.interface';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [LoansController],
  providers: [
    LoansService,
    {
      provide: 'LoanRepository',
      useClass: PrismaLoanRepository
    }
  ],
  exports: [LoansService]
})
export class LoansModule {}