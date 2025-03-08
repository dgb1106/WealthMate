import { Transaction } from '../entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';

export interface TransactionRepository {
  create(userId: string, categoryId: string, amount: number | Decimal, description: string): Promise<Transaction>;
  
  findById(id: string, userId: string): Promise<Transaction | null>;
  
  findAllByUser(userId: string): Promise<Transaction[]>;
  
  findAllByUserForDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  findAllByUserAndCategory(userId: string, categoryId: string): Promise<Transaction[]>;
  
  findAllIncomeByUser(userId: string): Promise<Transaction[]>;
  
  findAllExpensesByUser(userId: string): Promise<Transaction[]>;
  
  update(id: string, userId: string, data: {
    categoryId?: string;
    amount?: number | Decimal;
    description?: string;
  }): Promise<Transaction>;
  
  delete(id: string, userId: string): Promise<boolean>;
  
  getSummaryByCategory(userId: string, startDate: Date, endDate: Date): Promise<any[]>;

}
