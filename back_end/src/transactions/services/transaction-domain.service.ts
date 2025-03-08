import { Injectable, BadRequestException } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../common/enums/enum';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionDomainService {
  validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }
  
  validateAmount(amount: number | Decimal): void {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount);
    if (isNaN(numericAmount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
  }
  
  calculateBalanceEffect(transactionAmount: number | Decimal, categoryType: TransactionType): number {
    let balanceAdjustment = Number(transactionAmount);
    
    if (categoryType === TransactionType.EXPENSE) {
      balanceAdjustment = -Math.abs(balanceAdjustment);
    } else if (categoryType === TransactionType.INCOME) {
      balanceAdjustment = Math.abs(balanceAdjustment);
    }
    
    return balanceAdjustment;
  }
  
  formatTransactionAmount(amount: number | Decimal, categoryType: TransactionType): number {
    if (categoryType === TransactionType.EXPENSE) {
      return -Math.abs(Number(amount));
    } else {
      return Math.abs(Number(amount));
    }
  }
  
  getMonthRange(month: number, year: number): { firstDay: Date, lastDay: Date } {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { firstDay, lastDay };
  }
  
  getCurrentMonthRange(): { firstDay: Date, lastDay: Date } {
    const now = new Date();
    return this.getMonthRange(now.getMonth(), now.getFullYear());
  }
}
