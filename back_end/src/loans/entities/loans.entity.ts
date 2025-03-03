import { User } from "../../users/entities/users.entity";
import { Type } from "class-transformer";
import { LoanStatus } from "../../common/enums/enum";

export class Loan {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  name: string;
  
  due_date: Date;
  
  created_at: Date;
  
  total_amount: number;
  
  remaining_amount: number;
  
  status: LoanStatus;
  
  interest_rate: number;
  
  monthly_payment: number;
  
  description: string;
  
  constructor(partial: Partial<Loan>) {
    Object.assign(this, partial);
  }
  
  /**
   * Calculates the percentage of the loan that has been paid off
   * @returns Percentage paid (0-100)
   */
  getPayoffPercentage(): number {
    if (this.total_amount <= 0) return 0;
    const percentage = ((this.total_amount - this.remaining_amount) / this.total_amount) * 100;
    return Math.min(100, Math.max(0, percentage));
  }
  
  /**
   * Calculates the total number of months required to pay off the loan
   * @returns Total months to pay off
   */
  getTotalPaymentMonths(): number {
    if (this.monthly_payment <= 0) return 0;
    const totalWithInterest = this.calculateTotalWithInterest();
    return Math.ceil(totalWithInterest / this.monthly_payment);
  }
  
  /**
   * Calculates the total amount to be paid including interest
   * @returns Total amount with interest
   */
  calculateTotalWithInterest(): number {
    // Simple interest calculation for demonstration
    // In a real app, this would use a more complex amortization formula
    const monthsRemaining = this.getRemainingMonths();
    const monthlyInterestRate = this.interest_rate / 100 / 12;
    return this.remaining_amount * (1 + (monthlyInterestRate * monthsRemaining));
  }
  
  /**
   * Gets the number of months remaining until the due date
   * @returns Number of months remaining
   */
  getRemainingMonths(): number {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today) return 0;
    
    const months = (dueDate.getFullYear() - today.getFullYear()) * 12 +
                  (dueDate.getMonth() - today.getMonth());
    
    return Math.max(0, months);
  }
  
  /**
   * Determines if the loan is overdue
   * @returns Boolean indicating if the loan is overdue
   */
  isOverdue(): boolean {
    return this.due_date < new Date() && 
           this.status !== LoanStatus.PAID && 
           this.remaining_amount > 0;
  }
}