import { Type } from 'class-transformer';
import { ContributionType } from '../../common/enums/enum';

// Define lightweight interfaces for nested objects to avoid type errors
interface SimplifiedTransaction {
  id: string;
  amount: number;
  description?: string;
  userId?: string;
  created_at?: Date;
  user?: {
    id: string;
    name: string;
  };
}

interface SimplifiedGroup {
  id: string;
  name: string;
}

interface SimplifiedCategory {
  id: string;
  name: string;
}

interface SimplifiedBudget {
  id: string;
  categoryId: string;
  category?: SimplifiedCategory;
}

interface SimplifiedGoal {
  id: string;
  name: string;
}

export class FamilyTransactionContribution {
  id: string;
  transactionId: string;
  groupId: string;
  amount: number;
  contributionType: string; // "BUDGET" or "GOAL"
  targetId: string;
  created_at: Date;
  
  transaction?: SimplifiedTransaction;
  group?: SimplifiedGroup;
  familyBudget?: SimplifiedBudget;
  familyGoal?: SimplifiedGoal;
  
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
   * Optimized version to reduce memory usage
   */
  static fromPrisma(prismaContribution: any): FamilyTransactionContribution {
    // Use a lighter approach with conditional property access
    const contribution = new FamilyTransactionContribution({
      id: String(prismaContribution.id),
      transactionId: String(prismaContribution.transactionId),
      groupId: String(prismaContribution.groupId),
      amount: Number(prismaContribution.amount),
      contributionType: prismaContribution.contributionType,
      targetId: String(prismaContribution.targetId),
      created_at: new Date(prismaContribution.created_at),
    });
    
    // Only add related entities if they exist in the response
    if (prismaContribution.transaction) {
      contribution.transaction = {
        id: String(prismaContribution.transaction.id),
        amount: Number(prismaContribution.transaction.amount),
        description: prismaContribution.transaction.description,
        userId: prismaContribution.transaction.userId,
        user: prismaContribution.transaction.user ? {
          id: String(prismaContribution.transaction.user.id),
          name: prismaContribution.transaction.user.name
        } : undefined
      };
    }
    
    if (prismaContribution.group) {
      contribution.group = {
        id: String(prismaContribution.group.id),
        name: prismaContribution.group.name
      };
    }
    
    // Add only minimal budget data if needed and exists
    if (prismaContribution.familyBudget && 
        prismaContribution.contributionType === 'BUDGET') {
      contribution.familyBudget = {
        id: String(prismaContribution.familyBudget.id),
        categoryId: String(prismaContribution.familyBudget.categoryId),
        category: prismaContribution.familyBudget.category ? {
          id: String(prismaContribution.familyBudget.category.id),
          name: prismaContribution.familyBudget.category.name
        } : undefined
      };
    }
    
    // Add only minimal goal data if needed and exists
    if (prismaContribution.familyGoal && 
        prismaContribution.contributionType === 'GOAL') {
      contribution.familyGoal = {
        id: String(prismaContribution.familyGoal.id),
        name: prismaContribution.familyGoal.name
      };
    }
    
    return contribution;
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
