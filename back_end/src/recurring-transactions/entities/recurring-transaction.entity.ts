import { User } from "../../users/entities/users.entity";
import { Category } from "../../categories/entities/category.entity";
import { Type } from "class-transformer";
import { Frequency, TransactionType } from "../../common/enums/enum";
import { Transaction } from "../../transactions/entities/transaction.entity";

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
   * @param fromDate Optional date to calculate from (defaults to next_occurence)
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
   * Generate the next N occurrences of this recurring transaction
   * @param count Number of occurrences to generate
   * @returns Array of occurrence dates
   */
  generateNextOccurrences(count: number): Date[] {
    const occurrences: Date[] = [];
    let currentDate = this.next_occurence;
    
    for (let i = 0; i < count; i++) {
      occurrences.push(new Date(currentDate));
      currentDate = this.calculateNextOccurrence(currentDate);
    }
    
    return occurrences;
  }
  
  /**
   * Calculates the annual total of this recurring transaction
   * @returns Annual amount
   */
  getAnnualAmount(): number {
    const multiplier = this.getAnnualFrequencyMultiplier();
    return this.getAbsoluteAmount() * multiplier;
  }
  
  /**
   * Gets the absolute amount value regardless of sign
   * @returns Positive amount value
   */
  getAbsoluteAmount(): number {
    return Math.abs(this.amount);
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
   * @param currentDate Optional date to check against (defaults to current date)
   * @returns Boolean indicating if transaction is due
   */
  isDue(currentDate: Date = new Date()): boolean {
    return this.next_occurence <= currentDate;
  }
  
  /**
   * Updates next occurrence after processing
   * @param processedDate Date when the transaction was processed
   */
  processOccurrence(processedDate: Date = new Date()): void {
    this.next_occurence = this.calculateNextOccurrence();
  }
  
  /**
   * Get transaction type from the amount or category
   */
  getTransactionType(): TransactionType {
    if (this.category) {
      return this.category.type;
    }
    return this.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
  }
  
  /**
   * Creates a Transaction entity from this recurring transaction
   * @returns New Transaction entity
   */
  createTransactionInstance(): Partial<Transaction> {
    return {
      userId: this.userId,
      categoryId: this.categoryId,
      amount: this.amount,
      description: `${this.description} (Recurring)`,
      created_at: new Date()
    };
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
  
  /**
   * Returns days until next occurrence
   * @param currentDate Optional date to calculate from
   * @returns Number of days until next occurrence
   */
  getDaysUntilNextOccurrence(currentDate: Date = new Date()): number {
    const timeDiff = this.next_occurence.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  /**
   * Format the recurring transaction for API responses
   * @returns Formatted recurring transaction
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      userId: this.userId,
      categoryId: this.categoryId,
      categoryName: this.category?.name,
      categoryType: this.category?.type,
      amount: this.amount,
      formattedAmount: this.getAbsoluteAmount(),
      frequency: this.frequency,
      frequencyDescription: this.getFrequencyDescription(),
      created_at: this.created_at.toISOString(),
      next_occurence: this.next_occurence.toISOString(),
      description: this.description,
      daysUntilNextOccurrence: this.getDaysUntilNextOccurrence(),
      annualAmount: this.getAnnualAmount(),
      type: this.getTransactionType(),
      upcoming_occurrences: this.generateNextOccurrences(3)
        .map(date => date.toISOString())
    };
  }
  
  /**
   * Convert a Prisma recurring transaction to a RecurringTransaction entity
   * @param prismaRecurringTx Prisma recurring transaction
   * @returns RecurringTransaction entity
   */
  static fromPrisma(prismaRecurringTx: any): RecurringTransaction {
    return new RecurringTransaction({
      id: String(prismaRecurringTx.id),
      userId: prismaRecurringTx.userId,
      categoryId: String(prismaRecurringTx.categoryId),
      amount: Number(prismaRecurringTx.amount),
      frequency: prismaRecurringTx.frequency as Frequency,
      created_at: prismaRecurringTx.created_at,
      next_occurence: prismaRecurringTx.next_occurence,
      description: prismaRecurringTx.description,
      category: prismaRecurringTx.category 
        ? Category.fromPrisma(prismaRecurringTx.category) 
        : undefined,
      user: prismaRecurringTx.user 
        ? new User(prismaRecurringTx.user) 
        : undefined
    });
  }

  /**
   * Convert multiple Prisma recurring transactions to entities
   * @param prismaRecurringTxs Array of Prisma recurring transactions
   * @returns Array of RecurringTransaction entities
   */
  static fromPrismaArray(prismaRecurringTxs: any[]): RecurringTransaction[] {
    return prismaRecurringTxs.map(tx => RecurringTransaction.fromPrisma(tx));
  }
  
  /**
   * Create a new recurring transaction
   * @param data Required data
   * @returns New RecurringTransaction instance
   */
  static create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    frequency: Frequency;
    description: string;
    next_occurence: Date;
  }): RecurringTransaction {
    return new RecurringTransaction({
      ...data,
      created_at: new Date()
    });
  }
}
