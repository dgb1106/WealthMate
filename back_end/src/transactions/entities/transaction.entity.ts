import { User } from "../../users/entities/users.entity";
import { Category } from "../../categories/entities/categories.entity";
import { Type } from "class-transformer";

export class Transaction {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  categoryId: string;
  
  @Type(() => Category)
  category?: Category;
  
  amount: number;
  
  created_at: Date;
  
  description: string;
  
  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
  
  /**
   * Determines if the transaction is an expense
   * @returns Boolean indicating if this is an expense transaction
   */
  isExpense(): boolean {
    return this.amount < 0 || (this.category?.isExpenseCategory() === true);
  }
  
  /**
   * Determines if the transaction is income
   * @returns Boolean indicating if this is an income transaction
   */
  isIncome(): boolean {
    return this.amount > 0 || (this.category?.isIncomeCategory() === true);
  }
  
  /**
   * Gets the absolute amount of the transaction regardless of type
   * @returns Absolute amount value
   */
  getAbsoluteAmount(): number {
    return Math.abs(this.amount);
  }
  
  /**
   * Formats the transaction date to a readable string
   * @returns Formatted date string
   */
  getFormattedDate(locale: string = 'en-US'): string {
    return new Date(this.created_at).toLocaleDateString(locale);
  }

  
  /**
   * Checks if the transaction is within a given date range
   * @param startDate The start date of the range
   * @param endDate The end date of the range
   * @returns Boolean indicating if the transaction is within range
   */
  isWithinDateRange(startDate: Date, endDate: Date): boolean {
    return this.created_at >= startDate && this.created_at <= endDate;
  }
  
  /**
   * Checks if the transaction is from the current month
   * @returns Boolean indicating if the transaction is from current month
   */
  isCurrentMonth(): boolean {
    const now = new Date();
    const transactionDate = new Date(this.created_at);
    return (
      transactionDate.getMonth() === now.getMonth() && 
      transactionDate.getFullYear() === now.getFullYear()
    );
  }
  
  /**
   * Gets the month and year of the transaction as a string
   * @returns String in format "YYYY-MM"
   */
  getMonthYearString(): string {
    const date = new Date(this.created_at);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  /**
   * Calculates the effect this transaction has on the user's balance
   * @returns The amount to be added to user balance
   */
  getBalanceEffect(): number {
    return this.amount;
  }
  
  /**
   * Returns a display-friendly transaction type
   * @returns 'income' or 'expense' based on amount
   */
  getTransactionType(): 'income' | 'expense' {
    return this.amount >= 0 ? 'income' : 'expense';
  }
  
  /**
   * Format the transaction for API responses
   * @returns Formatted transaction object matching frontend expectations
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      type: this.getTransactionType(),
      category: this.category?.name || 'Unknown',
      categoryId: this.categoryId,
      description: this.description,
      date: this.getFormattedDate(),
      createdAt: this.created_at.toISOString(),
    };
  }
}