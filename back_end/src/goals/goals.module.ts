import { forwardRef, Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaGoalRepository } from './repositories/prisma-goal.repository';
import { GoalDomainService } from './services/goal-domain.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { DateUtilsService } from '../common/services/date-utils.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => TransactionsModule)
  ],
  controllers: [GoalsController],
  providers: [
    GoalsService, 
    PrismaGoalRepository,
    GoalDomainService,
    DateUtilsService
  ],
  exports: [
    GoalsService,
    GoalDomainService
  ]
})
export class GoalsModule {}
