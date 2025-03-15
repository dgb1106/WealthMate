import { RecurringTransaction } from "../entities/recurring-transaction.entity";
import { Frequency } from "../../common/enums/enum";
import { CreateRecurringTransactionDto } from "../dto/create-recurring-transaction.dto";
import { UpdateRecurringTransactionDto } from "../dto/update-recurring-transaction.dto";

export interface RecurringTransactionRepository {
  create(userId: string, createDto: CreateRecurringTransactionDto): Promise<RecurringTransaction>;
  
  findAll(userId: string): Promise<RecurringTransaction[]>;
  
  findById(id: string, userId: string): Promise<RecurringTransaction | null>;
  
  findByFrequency(userId: string, frequency: Frequency): Promise<RecurringTransaction[]>;
  
  findByCategory(userId: string, categoryId: string): Promise<RecurringTransaction[]>;
  
  findDueTransactions(date?: Date): Promise<RecurringTransaction[]>;
  
  update(id: string, userId: string, updateDto: UpdateRecurringTransactionDto): Promise<RecurringTransaction>;
  
  updateNextOccurrence(id: string, userId: string, nextOccurence: Date): Promise<RecurringTransaction>;
  
  delete(id: string, userId: string): Promise<boolean>;
  
  getUpcomingTransactions(userId: string, days: number): Promise<RecurringTransaction[]>;
  
  // Thêm phương thức này để sửa lỗi
  findActiveByUser(userId: string): Promise<RecurringTransaction[]>;
}
