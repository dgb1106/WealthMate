import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyTransactionContributionController } from '../controllers/family-transaction-contribution.controller';
import { FamilyTransactionContributionService } from '../services/family-transaction-contribution.service';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';
import { FamilyGroupModule } from './family-group.module';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyMemberModule } from './family-member.module';
import { FamilyBudget } from '../entities/family-budget.entity';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';

@Module({
  imports: [PrismaModule, FamilyGroupModule, FamilyMemberModule, FamilyBudget],
  controllers: [FamilyTransactionContributionController],
  providers: [
    FamilyTransactionContributionService,
    PrismaFamilyTransactionContributionRepository,
    PrismaFamilyMemberRepository,
    PrismaFamilyBudgetRepository

  ],
  exports: [FamilyTransactionContributionService]
})
export class FamilyTransactionContributionModule {}
