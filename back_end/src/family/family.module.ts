import { Module } from '@nestjs/common';
import { FamilyTransactionContributionModule } from './family-transaction-contribution.module';
import { FamilyGoalModule } from './modules/family-goal.module';
import { FamilyMemberModule } from './modules/family-member.module';
import { FamilyBudgetModule } from './modules/family-budget.module';
import { FamilyGroupModule } from './modules/family-group.module';

@Module({
  imports: [
    FamilyTransactionContributionModule,
    FamilyGoalModule,
    FamilyMemberModule,
    FamilyBudgetModule,
    FamilyGroupModule,
  ],
  exports: [
    FamilyTransactionContributionModule,
    FamilyGoalModule,
    FamilyMemberModule,
    FamilyBudgetModule,
    FamilyGroupModule,
  ],
})
export class FamilyModule {}
