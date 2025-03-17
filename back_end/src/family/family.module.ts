import { Module } from '@nestjs/common';
import { FamilyGroupModule } from './modules/family-group.module';
import { FamilyInvitationModule } from './modules/family-invitation.module';
import { FamilyBudgetModule } from './modules/family-budget.module';
import { FamilyGoalModule } from './modules/family-goal.module';
import { FamilyTransactionContributionModule } from './modules/family-transaction-contribution.module';

@Module({
  imports: [
    FamilyGroupModule,
    FamilyInvitationModule,
    FamilyBudgetModule,
    FamilyGoalModule,
    FamilyTransactionContributionModule
  ],
  exports: [
    FamilyGroupModule,
    FamilyInvitationModule,
    FamilyBudgetModule,
    FamilyGoalModule,
    FamilyTransactionContributionModule
  ]
})
export class FamilyModule {}
