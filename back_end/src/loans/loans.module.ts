import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaLoanRepository } from './repositories/prisma-loans.repository';

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [
    LoansService,
    PrismaLoanRepository,
    {
      provide: 'LoanRepository',
      useExisting: PrismaLoanRepository
    }
  ],
  exports: [LoansService]
})
export class LoansModule {}