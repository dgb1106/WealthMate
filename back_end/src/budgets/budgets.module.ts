import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { BudgetDomainService } from './services/budget-domain.service';
import { BudgetSchedulerService } from './services/budget-scheduler.service';
import { PrismaBudgetRepository } from './repositories/prisma-budget.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { DateUtilsService } from '../common/services/date-utils.service';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [BudgetsController],
  providers: [
    BudgetsService,
    BudgetDomainService,
    BudgetSchedulerService,
    {
      provide: 'BudgetRepository',
      useClass: PrismaBudgetRepository,
    },
    DateUtilsService,
  ],
  exports: [BudgetsService]
})
export class BudgetsModule {}
