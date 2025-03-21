import { forwardRef, Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaGoalRepository } from './repositories/prisma-goal.repository';
import { GoalDomainService } from './services/goal-domain.service';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => TransactionsModule)
  ],
  controllers: [GoalsController],
  providers: [
    GoalsService, 
    PrismaGoalRepository,
    GoalDomainService
  ],
  exports: [GoalsService]
})
export class GoalsModule {}
