import { Type } from 'class-transformer';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { FamilyGroup } from './family-group.entity';
import { FamilyBudget } from './family-budget.entity';
import { FamilyGoal } from './family-goal.entity';
import { ContributionType } from '../../common/enums/enum';

export class FamilyTransactionContribution {
  id: string;
  transactionId: string;
  groupId: string;
  amount: number;
  contributionType: string; // "BUDGET" or "GOAL"
  targetId: string;
  created_at: Date;
  
  @Type(() => Transaction)
  transaction?: Transaction;
  
  @Type(() => FamilyGroup)
  group?: FamilyGroup;
  
  @Type(() => FamilyBudget)
  familyBudget?: FamilyBudget;
  
  @Type(() => FamilyGoal)
  familyGoal?: FamilyGoal;
  
  constructor(partial: Partial<FamilyTransactionContribution>) {
    Object.assign(this, partial);
  }
  
  /**
   * Check if this contribution is for a budget
   */
  isBudgetContribution(): boolean {
    return this.contributionType === ContributionType.BUDGET;
  }
  
  /**
   * Check if this contribution is for a goal
   */
  isGoalContribution(): boolean {
    return this.contributionType === ContributionType.GOAL;
  }
  
  /**
   * Convert a Prisma family transaction contribution to a FamilyTransactionContribution entity
   */
  static fromPrisma(prismaContribution: any): FamilyTransactionContribution {
    return new FamilyTransactionContribution({
      id: String(prismaContribution.id),
      transactionId: String(prismaContribution.transactionId),
      groupId: String(prismaContribution.groupId),
      amount: Number(prismaContribution.amount),
      contributionType: prismaContribution.contributionType,
      targetId: String(prismaContribution.targetId),
      created_at: new Date(prismaContribution.created_at),
      transaction: prismaContribution.transaction 
        ? Transaction.fromPrisma(prismaContribution.transaction)
        : undefined,
      group: prismaContribution.group 
        ? FamilyGroup.fromPrisma(prismaContribution.group)
        : undefined,
      familyBudget: prismaContribution.familyBudget && 
        prismaContribution.contributionType === ContributionType.BUDGET 
        ? FamilyBudget.fromPrisma(prismaContribution.familyBudget)
        : undefined,
      familyGoal: prismaContribution.familyGoal && 
        prismaContribution.contributionType === ContributionType.GOAL 
        ? FamilyGoal.fromPrisma(prismaContribution.familyGoal)
        : undefined
    });
  }
  
  /**
   * Convert multiple Prisma family transaction contributions to entities
   */
  static fromPrismaArray(prismaContributions: any[]): FamilyTransactionContribution[] {
    return prismaContributions.map(contribution => 
      FamilyTransactionContribution.fromPrisma(contribution)
    );
  }
  
  /**
   * Format the family transaction contribution for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      transactionId: this.transactionId,
      groupId: this.groupId,
      amount: this.amount,
      contributionType: this.contributionType,
      targetId: this.targetId,
      created_at: this.created_at.toISOString(),
      transaction: this.transaction 
        ? {
            id: this.transaction.id,
            amount: this.transaction.amount,
            description: this.transaction.description,
            created_at: this.transaction.created_at?.toISOString()
          } 
        : undefined,
      group: this.group 
        ? { 
            id: this.group.id, 
            name: this.group.name 
          } 
        : undefined,
      target: this.isBudgetContribution() && this.familyBudget
        ? {
            id: this.familyBudget.id,
            name: this.familyBudget.category?.name,
            categoryId: this.familyBudget.categoryId
          }
        : this.isGoalContribution() && this.familyGoal
          ? {
              id: this.familyGoal.id,
              name: this.familyGoal.name
            }
          : undefined
    };
  }
}
