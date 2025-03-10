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

  validateMonth(month: number): void {
    if (month < 0 || month > 11) {
      throw new BadRequestException('Month must be between 0-11');
    }
  }
  
  calculateBalanceEffect(transactionAmount: number | Decimal, categoryType: TransactionType): number {
    let balanceAdjustment = Number(transactionAmount);

    if(isNaN(balanceAdjustment)) {
      throw new BadRequestException('Amount must be a valid number');
    }

    if(balanceAdjustment <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    
    if (categoryType === TransactionType.EXPENSE) {
      balanceAdjustment = -Math.abs(balanceAdjustment);
    } else if (categoryType === TransactionType.INCOME) {
      balanceAdjustment = Math.abs(balanceAdjustment);
    }
    
    return balanceAdjustment;
  }
  
  formatTransactionAmount(amount: number | Decimal, categoryType: TransactionType): number {
    if(isNaN(Number(amount))) {
      throw new BadRequestException('Amount must be a valid number');
    }

    if(Number(amount) == 0) {
      return 0;
    }

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
