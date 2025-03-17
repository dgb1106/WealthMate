import { User } from "../../users/entities/users.entity";
import { Category } from "../../categories/entities/category.entity";
import { Exclude, Type } from 'class-transformer';

export class Budget {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  categoryId: string;
  
  @Type(() => Category)
  category?: Category;
  
  limit_amount: number;
  spent_amount: number;
  start_date: Date;
  end_date: Date;
  
  constructor(partial: Partial<Budget>) {
    Object.assign(this, partial);
  }

  /**
   * Calculate the percentage of budget used
   * @returns Percentage of budget used (0-100)
   */
  getPercentageUsed(): number {
    if (this.limit_amount <= 0) return 0;
    
    const percentage = (this.spent_amount / this.limit_amount) * 100;
    // Round to 1 decimal place and cap at 100%
    return Math.round(percentage * 10) / 10;
  }

  /**
   * Determines if the budget is currently active
   * @param today Optional date to check against (defaults to current date)
   * @returns Boolean indicating if budget is active
   */
  isActive(today: Date = new Date()): boolean {
    return this.start_date <= today && this.end_date >= today;
  }

  /**
   * Checks if budget is over the limit
   * @returns Boolean indicating if spending exceeds limit
   */
  isOverLimit(): boolean {
    return this.spent_amount > this.limit_amount;
  }

  /**
   * Gets the remaining budget amount
   * @returns Amount remaining in the budget (can be negative if over budget)
   */
  getRemainingAmount(): number {
    return this.limit_amount - this.spent_amount;
  }

  /**
   * Gets the remaining budget as a percentage
   * @returns Percentage of budget remaining (0-100, 0 if over budget)
   */
  getRemainingPercentage(): number {
    const remaining = this.getRemainingAmount();
    if (remaining <= 0) return 0;
    
    return Math.min((remaining / this.limit_amount) * 100, 100);
  }

  /**
   * Determines the status of the budget
   * @returns Status string based on percentage used
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
   * Checks if a date is within the budget period
   * @param date Date to check
   * @returns Boolean indicating if date is within budget period
   */
  isDateWithinBudgetPeriod(date: Date): boolean {
    return date >= this.start_date && date <= this.end_date;
  }

  /**
   * Gets the number of days in the budget period
   * @returns Number of days
   */
  getBudgetDurationInDays(): number {
    return Math.ceil(
      (this.end_date.getTime() - this.start_date.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Gets the number of days elapsed in the budget period
   * @param today Optional current date (defaults to current date)
   * @returns Number of days elapsed
   */
  getDaysElapsed(today: Date = new Date()): number {
    const endPoint = today > this.end_date ? this.end_date : today;
    const startPoint = today < this.start_date ? today : this.start_date;
    
    return Math.ceil(
      (endPoint.getTime() - startPoint.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Calculates the daily budget amount
   * @returns Daily budget amount
   */
  getDailyBudgetAmount(): number {
    const days = this.getBudgetDurationInDays();
    return days > 0 ? this.limit_amount / days : this.limit_amount;
  }

  /**
   * Checks if spending is on track based on elapsed time
   * @param today Optional current date (defaults to current date)
   * @returns Boolean indicating if spending is on track
   */
  isSpendingOnTrack(today: Date = new Date()): boolean {
    if (!this.isActive(today)) return false;
    
    const daysTotal = this.getBudgetDurationInDays();
    const daysElapsed = this.getDaysElapsed(today);
    
    // Expected spending based on elapsed time
    const expectedSpending = (daysElapsed / daysTotal) * this.limit_amount;
    
    // If spending is less than expected, we're on track
    return this.spent_amount <= expectedSpending;
  }

  /**
   * Updates the spent amount and returns the updated budget
   * @param amount New amount to add to spent_amount
   * @returns This budget instance for method chaining
   */
  addSpending(amount: number): Budget {
    this.spent_amount += amount;
    return this;
  }

  /**
   * Validates that start date is before end date
   * @returns Boolean indicating if dates are valid
   */
  hasValidDateRange(): boolean {
    return this.start_date < this.end_date;
  }

  /**
   * Format the budget for API responses
   * @returns Formatted budget object matching frontend expectations
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      userId: this.userId,
      categoryId: this.categoryId,
      category: this.category,
      limit_amount: this.limit_amount,
      spent_amount: this.spent_amount,
      start_date: this.start_date.toISOString(),
      end_date: this.end_date.toISOString(),
      percentageUsed: this.getPercentageUsed(),
      status: this.getStatus(),
      remainingAmount: this.getRemainingAmount(),
      isActive: this.isActive()
    };
  }

  /**
   * Convert a Prisma budget object to a Budget entity
   * @param prismaBudget Prisma budget object from database
   * @returns Budget entity
   */
  static fromPrisma(prismaBudget: any): Budget {
    return new Budget({
      id: String(prismaBudget.id),
      userId: prismaBudget.userId,
      categoryId: String(prismaBudget.categoryId),
      limit_amount: Number(prismaBudget.limit_amount),
      spent_amount: Number(prismaBudget.spent_amount),
      start_date: prismaBudget.start_date,
      end_date: prismaBudget.end_date,
      category: prismaBudget.category ? new Category({
        id: String(prismaBudget.category.id),
        name: prismaBudget.category.name,
        type: prismaBudget.category.type
      }) : undefined,
      user: prismaBudget.user ? new User(prismaBudget.user) : undefined
    });
  }

  /**
   * Create budgets from Prisma budget objects
   * @param prismaBudgets Array of Prisma budget objects
   * @returns Array of Budget entities
   */
  static fromPrismaArray(prismaBudgets: any[]): Budget[] {
    return prismaBudgets.map(budget => Budget.fromPrisma(budget));
  }

  /**
   * Create a new budget with current date as creation time
   * @param data Budget data without id
   * @returns Budget entity
   */
  static create(data: Omit<Budget, 'id'>): Budget {
    return new Budget({
      ...data,
      spent_amount: data.spent_amount || 0
    });
  }
}