import { Type } from "class-transformer";
import { TransactionType } from "../../common/enums/enum";

export class Category {
  id: string;
  
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

  /**
   * Converts the category to a response format
   * @returns Category in response format
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type
    };
  }
  
  /**
   * Converts a Prisma category to a Category entity
   * @param primaCategory Prisma category object
   * @returns Category entity
   */
  static fromPrisma(primaCategory: any): Category {
    return new Category({
      id: primaCategory.id,
      name: primaCategory.name,
      type: primaCategory.type
    });
  }
}