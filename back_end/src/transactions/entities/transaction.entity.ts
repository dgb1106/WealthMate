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
}