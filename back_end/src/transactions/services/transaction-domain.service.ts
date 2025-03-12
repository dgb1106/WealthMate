import { Injectable, BadRequestException } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../common/enums/enum';
import { Decimal } from '@prisma/client/runtime/library';
import { DateUtilsService } from '../../common/services/date-utils.service';

@Injectable()
export class TransactionDomainService {
  constructor(private readonly dateUtils: DateUtilsService) {}

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
    return this.dateUtils.getSpecificMonthRange(month, year);
  }
  
  getCurrentMonthRange(): { firstDay: Date, lastDay: Date } {
    return this.dateUtils.getCurrentMonthRange();
  }
  
  /**
   * Tính tổng số tiền thu nhập từ danh sách giao dịch
   * @param transactions Danh sách giao dịch
   * @returns Tổng số tiền thu nhập
   */
  calculateTotalIncome(transactions: Transaction[]): number {
    return transactions
      .filter(transaction => transaction.isIncome())
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }
  
  /**
   * Tính tổng số tiền chi tiêu từ danh sách giao dịch
   * @param transactions Danh sách giao dịch
   * @returns Tổng số tiền chi tiêu
   */
  calculateTotalExpense(transactions: Transaction[]): number {
    return transactions
      .filter(transaction => transaction.isExpense())
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }
  
  /**
   * Nhóm giao dịch theo tháng
   * @param transactions Danh sách giao dịch
   * @returns Giao dịch được nhóm theo tháng (định dạng YYYY-MM)
   */
  groupTransactionsByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const monthYear = transaction.getMonthYearString();
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }
  
  /**
   * Nhóm giao dịch theo danh mục
   * @param transactions Danh sách giao dịch
   * @returns Giao dịch được nhóm theo ID danh mục
   */
  groupTransactionsByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const categoryId = transaction.categoryId;
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }
}
