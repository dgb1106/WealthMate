import { Type } from 'class-transformer';
import { FamilyMember } from './family-member.entity';
import { FamilyBudget } from './family-budget.entity';
import { FamilyGoal } from './family-goal.entity';

export class FamilyGroup {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  avatar_url?: string;
  
  @Type(() => FamilyMember)
  members?: FamilyMember[];
  
  @Type(() => FamilyBudget)
  budgets?: FamilyBudget[];
  
  @Type(() => FamilyGoal)
  goals?: FamilyGoal[];
  
  constructor(partial: Partial<FamilyGroup>) {
    Object.assign(this, partial);
  }
  
  /**
   * Convert a Prisma family group to a FamilyGroup entity
   */
  static fromPrisma(prismaFamilyGroup: any): FamilyGroup {
    return new FamilyGroup({
      id: String(prismaFamilyGroup.id),
      name: prismaFamilyGroup.name,
      description: prismaFamilyGroup.description,
      created_at: new Date(prismaFamilyGroup.created_at),
      updated_at: new Date(prismaFamilyGroup.updated_at),
      avatar_url: prismaFamilyGroup.avatar_url,
      members: prismaFamilyGroup.members 
        ? prismaFamilyGroup.members.map(FamilyMember.fromPrisma) 
        : undefined,
      budgets: prismaFamilyGroup.budgets 
        ? prismaFamilyGroup.budgets.map(FamilyBudget.fromPrisma) 
        : undefined,
      goals: prismaFamilyGroup.goals 
        ? prismaFamilyGroup.goals.map(FamilyGoal.fromPrisma) 
        : undefined,
    });
  }
  
  /**
   * Convert multiple Prisma family groups to entities
   */
  static fromPrismaArray(prismaFamilyGroups: any[]): FamilyGroup[] {
    return prismaFamilyGroups.map(group => FamilyGroup.fromPrisma(group));
  }
  
  /**
   * Format the family group for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      avatar_url: this.avatar_url,
      member_count: this.members?.length ?? 0,
      budget_count: this.budgets?.length ?? 0,
      goal_count: this.goals?.length ?? 0
    };
  }
}
