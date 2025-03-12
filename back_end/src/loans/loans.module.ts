import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaLoanRepository } from './repositories/prisma-loans.repository';
import { LoanDomainService } from './services/loan-domain.service';

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [
    LoansService,
    LoanDomainService,
    {
      provide: 'LoanRepository',
      useClass: PrismaLoanRepository
    }
  ],
  exports: [LoansService]
})
export class LoansModule {}
