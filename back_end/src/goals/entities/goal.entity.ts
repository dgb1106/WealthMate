import { User } from "../../users/entities/users.entity";
import { Type } from "class-transformer";
import { GoalStatus } from "../../common/enums/enum";

export class Goal {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  name: string;
  
  target_amount: number;
  
  saved_amount: number;
  
  status: GoalStatus;
  
  due_date: Date;
  
  created_at: Date;
  
  constructor(partial: Partial<Goal>) {
    Object.assign(this, partial);
  }
  
  /**
   * Calculates the percentage progress toward the goal
   * @returns Percentage completed (0-100)
   */
  getProgressPercentage(): number {
    if (this.target_amount <= 0) return 0;
    const percentage = (this.saved_amount / this.target_amount) * 100;
    return Math.min(100, Math.max(0, percentage));
  }
  
  /**
   * Calculates the remaining amount needed to reach the goal
   * @returns Remaining amount
   */
  getRemainingAmount(): number {
    return Math.max(0, this.target_amount - this.saved_amount);
  }
  
  /**
   * Determines if the goal deadline has passed
   * @returns Boolean indicating if the goal is overdue
   */
  isOverdue(): boolean {
    return this.due_date < new Date() && this.status !== GoalStatus.COMPLETED;
  }
  
  /**
   * Calculates the average amount to save daily to reach the goal on time
   * @returns Daily saving amount needed
   */
  getDailySavingNeeded(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today || this.saved_amount >= this.target_amount) return 0;
    
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const amountRemaining = this.getRemainingAmount();
    
    return amountRemaining / daysRemaining;
  }
}