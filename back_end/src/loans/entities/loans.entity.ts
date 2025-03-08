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
  
  percentagePaid?: number; // Add this new property

  constructor(partial: any) {
    // Convert BigInt ID to string if present
    if (partial?.id) {
      this.id = String(partial.id);
    }
    
    if (partial?.total_amount && partial?.remaining_amount) {
      // Calculate percentage paid
      const totalAmount = Number(partial.total_amount);
      const remainingAmount = Number(partial.remaining_amount);
      this.percentagePaid = totalAmount > 0 
        ? Math.round(((totalAmount - remainingAmount) / totalAmount) * 100 * 10) / 10 
        : 0;
    }
    
    // Copy other properties
    Object.assign(this, {
      ...partial,
      id: this.id, // Use the converted ID
      // Convert other BigInt values to numbers if needed
      total_amount: partial?.total_amount ? Number(partial.total_amount) : undefined,
      remaining_amount: partial?.remaining_amount ? Number(partial.remaining_amount) : undefined,
      interest_rate: partial?.interest_rate ? Number(partial.interest_rate) : undefined,
      monthly_payment: partial?.monthly_payment ? Number(partial.monthly_payment) : undefined
    });
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