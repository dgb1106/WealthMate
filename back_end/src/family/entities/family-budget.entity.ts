import { Type } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { FamilyGroup } from './family-group.entity';
import { Category } from '../../categories/entities/category.entity';

export class FamilyBudget {
  id: string;
  groupId: string;
  categoryId: string;
  limit_amount: number;
  spent_amount: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  created_by: string;
  
  @Type(() => FamilyGroup)
  group?: FamilyGroup;
  
  @Type(() => Category)
  category?: Category;
  
  @Type(() => User)
  creator?: User;
  
  constructor(partial: Partial<FamilyBudget>) {
    Object.assign(this, partial);
  }
  
  /**
   * Calculate the percentage of budget used
   */
  getPercentageUsed(): number {
    if (this.limit_amount <= 0) return 0;
    
    const percentage = (this.spent_amount / this.limit_amount) * 100;
    return Math.round(percentage * 10) / 10;
  }
  
  /**
   * Determines if the budget is currently active
   */
  isActive(today: Date = new Date()): boolean {
    return this.start_date <= today && this.end_date >= today;
  }
  
  /**
   * Checks if budget is over the limit
   */
  isOverLimit(): boolean {
    return this.spent_amount > this.limit_amount;
  }
  
  /**
   * Gets the remaining budget amount
   */
  getRemainingAmount(): number {
    return this.limit_amount - this.spent_amount;
  }
  
  /**
   * Gets the remaining budget as a percentage
   */
  getRemainingPercentage(): number {
    const remaining = this.getRemainingAmount();
    if (remaining <= 0) return 0;
    
    return Math.min((remaining / this.limit_amount) * 100, 100);
  }
  
  /**
   * Determines the status of the budget
   */
  getStatus(): 'excellent' | 'good' | 'warning' | 'danger' | 'over_budget' {
    const percentUsed = this.getPercentageUsed();
    
    if (percentUsed > 100) return 'over_budget';
    if (percentUsed > 85) return 'danger';
    if (percentUsed > 70) return 'warning';
    if (percentUsed > 50) return 'good';
    return 'excellent';
  }
  
  /**
   * Convert a Prisma family budget to a FamilyBudget entity
   */
  static fromPrisma(prismaFamilyBudget: any): FamilyBudget {
    return new FamilyBudget({
      id: String(prismaFamilyBudget.id),
      groupId: String(prismaFamilyBudget.groupId),
      categoryId: String(prismaFamilyBudget.categoryId),
      limit_amount: Number(prismaFamilyBudget.limit_amount),
      spent_amount: Number(prismaFamilyBudget.spent_amount),
      start_date: new Date(prismaFamilyBudget.start_date),
      end_date: new Date(prismaFamilyBudget.end_date),
      created_at: new Date(prismaFamilyBudget.created_at),
      created_by: prismaFamilyBudget.created_by,
    });
  }
  
  /**
   * Convert multiple Prisma family budgets to entities
   */
  static fromPrismaArray(prismaFamilyBudgets: any[]): FamilyBudget[] {
    return prismaFamilyBudgets.map(budget => FamilyBudget.fromPrisma(budget));
  }
  
  /**
   * Format the family budget for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      groupId: this.groupId,
      categoryId: this.categoryId,
      categoryName: this.category?.name,
      limit_amount: this.limit_amount,
      spent_amount: this.spent_amount,
      start_date: this.start_date.toISOString(),
      end_date: this.end_date.toISOString(),
      created_at: this.created_at.toISOString(),
      created_by: this.created_by,
      creator_name: this.creator?.name,
      percentageUsed: this.getPercentageUsed(),
      status: this.getStatus(),
      remainingAmount: this.getRemainingAmount(),
      isActive: this.isActive(),
      isOverLimit: this.isOverLimit()
    };
  }
}
