import { Module } from '@nestjs/common';
import { FamilyTransactionContributionModule } from './modules/family-transaction-contribution.module';
import { FamilyGoalModule } from './modules/family-goal.module';
import { FamilyMemberModule } from './modules/family-member.module';
import { FamilyBudgetModule } from './modules/family-budget.module';
import { FamilyGroupModule } from './modules/family-group.module';
import { FamilyInvitation } from './entities/family-invitation.entity';
import { FamilyInvitationModule } from './modules/family-invitation.module';
import { CleanupExpiredInvitationsTask } from './tasks/cleanup-expired-invitations.task';

@Module({
  imports: [
    FamilyTransactionContributionModule,
    FamilyGoalModule,
    FamilyMemberModule,
    FamilyBudgetModule,
    FamilyGroupModule,
    FamilyInvitationModule,
  ],
  providers: [
    CleanupExpiredInvitationsTask,
  ],
  exports: [
    FamilyTransactionContributionModule,
    FamilyGoalModule,
    FamilyMemberModule,
    FamilyBudgetModule,
    FamilyGroupModule,
    FamilyInvitationModule,
  ],
})
export class FamilyModule {}
