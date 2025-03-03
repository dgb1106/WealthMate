import { Jar } from "../../jars/entities/jars.entity";
import { Type } from "class-transformer";
import { TransactionType } from "../../common/enums/enum";

export class Category {
  id: string;
  
  jarId: string;
  
  @Type(() => Jar)
  jar?: Jar;
  
  name: string;
  
  type: TransactionType;
  
  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
  
  /**
   * Gets a formatted display name with transaction type
   * @returns Formatted category name
   */
  getDisplayName(): string {
    return `${this.name} (${this.type})`;
  }
  
  /**
   * Checks if the category is for income transactions
   * @returns True if category is for income
   */
  isIncomeCategory(): boolean {
    return this.type === TransactionType.INCOME;
  }
  
  /**
   * Checks if the category is for expense transactions
   * @returns True if category is for expense
   */
  isExpenseCategory(): boolean {
    return this.type === TransactionType.EXPENSE;
  }
}