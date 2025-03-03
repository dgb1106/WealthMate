import { Type } from "class-transformer";
import { JarType } from "../../common/enums/enum";
import { Category } from "../../categories/entities/categories.entity";

export class Jar {
  id: string;
  
  name: string;
  
  limit_amount: number;
  
  type: JarType;
  
  allocation_percentage: number;
  
  @Type(() => Category)
  categories?: Category[];
  
  constructor(partial: Partial<Jar>) {
    Object.assign(this, partial);
  }
  
  /**
   * Gets the jar's current balance based on all transactions in its categories
   * This would typically be calculated in the service layer using the database
   * but is included here as a placeholder for the domain concept
   */
  getCurrentBalance(): number {
    // This would be implemented in the service by querying transactions
    // Placeholder for domain concept
    return 0;
  }
  
  /**
   * Calculates how much of incoming money should go to this jar
   * @param amount Total amount to allocate
   * @returns Amount that should go to this jar
   */
  calculateAllocation(amount: number): number {
    return (amount * this.allocation_percentage) / 100;
  }
  
  /**
   * Checks if the jar is at or over its limit
   * @param currentBalance The current balance in the jar
   * @returns True if jar is at or above its limit
   */
  isAtLimit(currentBalance: number = this.getCurrentBalance()): boolean {
    return currentBalance >= this.limit_amount;
  }
  
  /**
   * Gets the remaining capacity before reaching the jar's limit
   * @param currentBalance The current balance in the jar
   * @returns Amount that can still be added before reaching limit
   */
  getRemainingCapacity(currentBalance: number = this.getCurrentBalance()): number {
    return Math.max(0, this.limit_amount - currentBalance);
  }
}