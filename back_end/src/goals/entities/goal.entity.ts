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
  
  // --- New functions for domain support ---
  
  static fromPrisma(prismaGoal: any): Goal {
    return new Goal({
      id: String(prismaGoal.id),
      userId: prismaGoal.userId,
      name: prismaGoal.name,
      target_amount: Number(prismaGoal.target_amount),
      saved_amount: Number(prismaGoal.saved_amount),
      status: prismaGoal.status,
      due_date: new Date(prismaGoal.due_date),
      created_at: new Date(prismaGoal.created_at)
    });
  }
  
  isCompleted(): boolean {
    if (this.status === GoalStatus.COMPLETED) return true;
    return this.saved_amount >= this.target_amount;
  }
  
  getDaysRemaining(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    if (dueDate <= today) return 0;
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Add funds to the goal
   * @param amount Amount to add
   */
  addFunds(amount: number): void {
    this.saved_amount += amount;
    this.updateStatus();
  }

  /**
   * Withdraw funds from the goal
   * @param amount Amount to withdraw
   */
  withdrawFunds(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    if (amount > this.saved_amount) {
      throw new Error(`Cannot withdraw more than available. Available: ${this.saved_amount}, Requested: ${amount}`);
    }
    
    this.saved_amount -= amount;
    
    // Cập nhật status sau khi rút tiền
    if (this.saved_amount <= 0) {
      this.status = GoalStatus.PENDING;
    } else if (this.saved_amount < this.target_amount && this.status === GoalStatus.COMPLETED) {
      this.status = GoalStatus.IN_PROGRESS;
    }
  }
  
  updateSavedAmount(newAmount: number): void {
    this.saved_amount = newAmount;
    this.updateStatus();
  }
  
  private updateStatus(): void {
    if (this.isCompleted()) {
      this.status = GoalStatus.COMPLETED;
    }
    else if(this.isOverdue())
    {
      this.status = GoalStatus.OVER_DUE;
    } else if (this.saved_amount > 0) {
      this.status = GoalStatus.IN_PROGRESS;
    } else {
      this.status = GoalStatus.PENDING;
    }
  }
  
  /**
   * Calculates monthly saving needed to reach the goal on time
   * @returns Monthly amount needed to save
   */
  getMonthlyPaymentNeeded(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today || this.saved_amount >= this.target_amount) return 0;
    
    const monthsRemaining = this.getMonthsRemaining();
    return monthsRemaining > 0 ? this.getRemainingAmount() / monthsRemaining : this.getRemainingAmount();
  }
  
  /**
   * Gets the number of months remaining until the due date
   * @returns Number of months remaining
   */
  getMonthsRemaining(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today) return 0;
    
    const months = (dueDate.getFullYear() - today.getFullYear()) * 12 +
                  (dueDate.getMonth() - today.getMonth());
    
    return Math.max(1, months); // Minimum 1 month to avoid division by zero
  }
  
  /**
   * Gets a readable string describing the time remaining
   * @returns String describing time remaining
   */
  getTimeRemainingText(): string {
    const daysRemaining = this.getDaysRemaining();
    
    if (daysRemaining <= 0) return "Overdue";
    if (daysRemaining === 1) return "1 day left";
    if (daysRemaining < 30) return `${daysRemaining} days left`;
    
    const months = Math.floor(daysRemaining / 30);
    return months === 1 ? "1 month left" : `${months} months left`;
  }
  
  /**
   * Gets status of goal for UI/UX purposes
   * @returns Status label for the goal
   */
  getStatus(): 'excellent' | 'good' | 'warning' | 'danger' | 'overdue' | 'completed' {
    if (this.isCompleted()) return 'completed';
    if (this.isOverdue()) return 'overdue';
    
    const percentage = this.getProgressPercentage();
    const daysRemaining = this.getDaysRemaining();
    
    // If there are few days left but progress is low
    if (daysRemaining < 30 && percentage < 70) return 'danger';
    if (daysRemaining < 60 && percentage < 50) return 'warning';
    
    if (percentage >= 75) return 'excellent';
    if (percentage >= 50) return 'good';
    if (percentage >= 25) return 'warning';
    
    return 'danger';
  }

  
  /**
   * Format the goal for API responses
   * @returns Formatted goal object matching frontend expectations
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      target_amount: this.target_amount,
      saved_amount: this.saved_amount,
      status: this.status,
      statusLabel: this.getStatus(),
      due_date: this.due_date.toISOString(),
      created_at: this.created_at.toISOString(),
      percentageCompleted: Math.round(this.getProgressPercentage() * 10) / 10,
      remainingAmount: this.getRemainingAmount(),
      dailySavingNeeded: Math.round(this.getDailySavingNeeded() * 100) / 100,
      monthlySavingNeeded: Math.round(this.getMonthlyPaymentNeeded() * 100) / 100,
      timeRemaining: this.getTimeRemainingText(),
      daysRemaining: this.getDaysRemaining(),
    };
  }
  
  /**
   * Create a new Goal with default values
   * @param data Required goal data
   * @returns New Goal instance
   */
  static create(data: {
    userId: string, 
    name: string, 
    target_amount: number,
    due_date: Date,
    saved_amount?: number
  }): Goal {
    return new Goal({
      userId: data.userId,
      name: data.name,
      target_amount: data.target_amount,
      saved_amount: data.saved_amount || 0,
      status: GoalStatus.PENDING,
      due_date: new Date(data.due_date),
      created_at: new Date()
    });
  }
  
  /**
   * Convert multiple Prisma goal objects to Goal entities
   * @param prismaGoals Array of Prisma goal objects
   * @returns Array of Goal entities
   */
  static fromPrismaArray(prismaGoals: any[]): Goal[] {
    return prismaGoals.map(goal => Goal.fromPrisma(goal));
  }
}