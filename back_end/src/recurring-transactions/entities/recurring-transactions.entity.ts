import { User } from "../../users/entities/user.entity";
import { Category } from "../../categories/entities/categories.entity";
import { Type } from "class-transformer";
import { Frequency } from "../../common/enums/enum";

export class RecurringTransaction {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  categoryId: string;
  
  @Type(() => Category)
  category?: Category;
  
  amount: number;
  
  frequency: Frequency;
  
  created_at: Date;
  
  next_occurence: Date;
  
  description: string;
  
  constructor(partial: Partial<RecurringTransaction>) {
    Object.assign(this, partial);
  }
  
  /**
   * Calculates the next occurrence date based on frequency
   * @returns Date of the next occurrence
   */
  calculateNextOccurrence(fromDate: Date = this.next_occurence): Date {
    const nextDate = new Date(fromDate);
    
    switch (this.frequency) {
      case Frequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case Frequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case Frequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case Frequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  }
  
  /**
   * Calculates the annual total of this recurring transaction
   * @returns Annual amount
   */
  getAnnualAmount(): number {
    const multiplier = this.getAnnualFrequencyMultiplier();
    return this.amount * multiplier;
  }
  
  /**
   * Gets the frequency multiplier for calculating annual totals
   * @returns Number of occurrences per year
   */
  private getAnnualFrequencyMultiplier(): number {
    switch (this.frequency) {
      case Frequency.DAILY: return 365;
      case Frequency.WEEKLY: return 52;
      case Frequency.MONTHLY: return 12;
      case Frequency.YEARLY: return 1;
      default: return 0;
    }
  }
  
  /**
   * Determines if the recurring transaction is due
   * @param currentDate The date to check against
   * @returns Boolean indicating if transaction is due
   */
  isDue(currentDate: Date = new Date()): boolean {
    return this.next_occurence <= currentDate;
  }
  
  /**
   * Describes the transaction frequency in human-readable form
   * @returns Human-readable frequency string
   */
  getFrequencyDescription(): string {
    switch (this.frequency) {
      case Frequency.DAILY: return 'Daily';
      case Frequency.WEEKLY: return 'Weekly';
      case Frequency.MONTHLY: return 'Monthly';
      case Frequency.YEARLY: return 'Yearly';
      default: return 'Custom';
    }
  }
}