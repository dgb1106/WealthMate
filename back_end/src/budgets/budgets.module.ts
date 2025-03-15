import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetDomainService } from './services/budget-domain.service';
import { PrismaBudgetRepository } from './repositories/prisma-budget.repository';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [BudgetsController],
  providers: [
    BudgetsService,
    BudgetDomainService, 
    {
      provide: 'BudgetRepository',
      useClass: PrismaBudgetRepository,
    }
  ],
  exports: [BudgetsService],
})
export class BudgetsModule {}
