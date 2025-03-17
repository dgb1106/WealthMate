import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyTransactionContributionController } from '../controllers/family-transaction-contribution.controller';
import { FamilyTransactionContributionService } from '../services/family-transaction-contribution.service';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';
import { FamilyGroupModule } from './family-group.module';
import { FamilyBudgetModule } from './family-budget.module';
import { FamilyGoalModule } from './family-goal.module';

@Module({
  imports: [PrismaModule, FamilyGroupModule, FamilyBudgetModule, FamilyGoalModule],
  controllers: [FamilyTransactionContributionController],
  providers: [
    FamilyTransactionContributionService,
    PrismaFamilyTransactionContributionRepository
  ],
  exports: [FamilyTransactionContributionService]
})
export class FamilyTransactionContributionModule {}
