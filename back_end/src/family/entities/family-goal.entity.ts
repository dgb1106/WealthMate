import { Type } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { FamilyGroup } from './family-group.entity';
import { GoalStatus } from '../../common/enums/enum';

export class FamilyGoal {
  id: string;
  groupId: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  status: GoalStatus;
  due_date: Date;
  created_at: Date;
  created_by: string;
  
  @Type(() => FamilyGroup)
  group?: FamilyGroup;
  
  @Type(() => User)
  creator?: User;
  
  constructor(partial: Partial<FamilyGoal>) {
    Object.assign(this, partial);
  }
  
  /**
   * Calculates the percentage progress toward the goal
   */
  getProgressPercentage(): number {
    if (this.target_amount <= 0) return 0;
    const percentage = (this.saved_amount / this.target_amount) * 100;
    return Math.min(100, Math.max(0, percentage));
  }
  
  /**
   * Calculates the remaining amount needed to reach the goal
   */
  getRemainingAmount(): number {
    return Math.max(0, this.target_amount - this.saved_amount);
  }
  
  /**
   * Determines if the goal deadline has passed
   */
  isOverdue(): boolean {
    return this.due_date < new Date() && this.status !== GoalStatus.COMPLETED;
  }
  
  /**
   * Determines if the goal is completed
   */
  isCompleted(): boolean {
    return this.status === GoalStatus.COMPLETED || this.saved_amount >= this.target_amount;
  }
  
  /**
   * Gets the number of days remaining until the goal due date
   */
  getDaysRemaining(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    if (dueDate <= today) return 0;
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Updates the goal status based on saved amount
   */
  updateStatus(): void {
    if (this.saved_amount >= this.target_amount) {
      this.status = GoalStatus.COMPLETED;
    } else if (this.saved_amount > 0) {
      this.status = GoalStatus.IN_PROGRESS;
    } else {
      this.status = GoalStatus.PENDING;
    }
  }
  
  /**
   * Adds funds to the goal
   */
  addFunds(amount: number): void {
    this.saved_amount += amount;
    this.updateStatus();
  }
  
  /**
   * Convert a Prisma family goal to a FamilyGoal entity
   */
  static fromPrisma(prismaFamilyGoal: any): FamilyGoal {
    return new FamilyGoal({
      id: String(prismaFamilyGoal.id),
      groupId: String(prismaFamilyGoal.groupId),
      name: prismaFamilyGoal.name,
      target_amount: Number(prismaFamilyGoal.target_amount),
      saved_amount: Number(prismaFamilyGoal.saved_amount),
      status: prismaFamilyGoal.status,
      due_date: new Date(prismaFamilyGoal.due_date),
      created_at: new Date(prismaFamilyGoal.created_at),
      created_by: prismaFamilyGoal.created_by,
      group: prismaFamilyGoal.group 
        ? FamilyGroup.fromPrisma(prismaFamilyGoal.group)
        : undefined,
      creator: prismaFamilyGoal.creator
        ? new User(prismaFamilyGoal.creator)
        : undefined
    });
  }
  
  /**
   * Convert multiple Prisma family goals to entities
   */
  static fromPrismaArray(prismaFamilyGoals: any[]): FamilyGoal[] {
    return prismaFamilyGoals.map(goal => FamilyGoal.fromPrisma(goal));
  }
  
  /**
   * Format the family goal for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      groupId: this.groupId,
      name: this.name,
      target_amount: this.target_amount,
      saved_amount: this.saved_amount,
      status: this.status,
      due_date: this.due_date.toISOString(),
      created_at: this.created_at.toISOString(),
      created_by: this.created_by,
      creator_name: this.creator?.name,
      percentageCompleted: Math.round(this.getProgressPercentage() * 10) / 10,
      remainingAmount: this.getRemainingAmount(),
      daysRemaining: this.getDaysRemaining(),
      isOverdue: this.isOverdue(),
      isCompleted: this.isCompleted()
    };
  }
}
