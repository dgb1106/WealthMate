import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaGoalRepository } from './repositories/prisma-goal.repository';
import { GoalDomainService } from './services/goal-domain.service';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [
    GoalsService, 
    PrismaGoalRepository,
    GoalDomainService
  ],
  exports: [GoalsService]
})
export class GoalsModule {}
