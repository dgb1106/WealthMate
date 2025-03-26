import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyBudgetController } from '../controllers/family-budget.controller';
import { FamilyBudgetService } from '../services/family-budget.service';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { FamilyGroupModule } from './family-group.module';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { UserDomainService } from '../../users/services/user-domain.service';
import { FamilyTransactionContributionModule } from './family-transaction-contribution.module';

@Module({
  imports: [PrismaModule, FamilyGroupModule, FamilyTransactionContributionModule],
  controllers: [FamilyBudgetController],
  providers: [
    FamilyBudgetService,
    PrismaFamilyBudgetRepository,
    PrismaFamilyMemberRepository,
    UserDomainService
  ],
  exports: [FamilyBudgetService, PrismaFamilyBudgetRepository]
})
export class FamilyBudgetModule {}
