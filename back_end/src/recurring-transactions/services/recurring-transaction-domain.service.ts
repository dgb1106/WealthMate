import { Injectable, BadRequestException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { RecurringTransactionRepository } from '../repositories/recurring-transaction-repository.interface';
import { RecurringTransaction } from '../entities/recurring-transaction.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { Frequency, TransactionType } from '../../common/enums/enum';
import { CreateRecurringTransactionDto } from '../dto/create-recurring-transaction.dto';
import { TransactionService } from '../../transactions/transactions.service';
import { CreateTransactionDto } from '../../transactions/dto/create-transaction.dto';

@Injectable()
export class RecurringTransactionDomainService {
  private readonly logger = new Logger(RecurringTransactionDomainService.name);

  constructor(
    @Inject('RecurringTransactionRepository')
    private readonly recurringTxRepository: RecurringTransactionRepository,
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService
  ) {}

  /**
   * Validate the frequency and amount of a recurring transaction
   */
  validateRecurringTransactionData(dto: CreateRecurringTransactionDto): void {
    // Check if frequency is valid
    if (!Object.values(Frequency).includes(dto.frequency)) {
      throw new BadRequestException(`Invalid frequency: ${dto.frequency}`);
    }
    
    // Check if amount is valid
    if (isNaN(dto.amount) || dto.amount === 0) {
      throw new BadRequestException('Amount must be a non-zero number');
    }
    
    // Check if next_occurence is in the future
    const nextOccurence = new Date(dto.next_occurence);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (nextOccurence < today) {
      throw new BadRequestException('Next occurrence date must be in the future');
    }
  }

  /**
   * Processes all due recurring transactions
   * @returns Array of created transactions
   */
  async processDueTransactions(): Promise<{ processedCount: number; transactions: any[]; errors: string[] }> {
    const today = new Date();

    return await this.prisma.$transaction(async (prisma) => {
      const dueTransactions = await this.recurringTxRepository.findDueTransactions(today);
      const createdTransactions: any[] = [];
      const errors: string[] = [];
      
      this.logger.log(`Found ${dueTransactions.length} due recurring transactions to process`);
      
      for (const recurringTx of dueTransactions) {
        try {
          const result = await this.processTransaction(recurringTx);
          if (result) {
            createdTransactions.push(result);
            this.logger.log(`Successfully processed recurring transaction ID: ${recurringTx.id}`);
          }
        } catch (error) {
          const errorMessage = `Error processing recurring transaction ${recurringTx.id}: ${error.message}`;
          this.logger.error(errorMessage);
          errors.push(errorMessage);
        }
      }
      
      return {
        processedCount: createdTransactions.length,
        transactions: createdTransactions,
        errors
      };
    });
  }

  /**
   * Process a single recurring transaction
   * @param recurringTx Recurring transaction to process
   * @returns Created transaction or null if processing failed
   */
  async processTransaction(recurringTx: RecurringTransaction): Promise<any> {
    return this.prisma.$transaction(async () => {
      try {
        // Chuẩn bị dữ liệu cho CreateTransactionDto
        const createTransactionDto: CreateTransactionDto = {
          categoryId: recurringTx.categoryId,
          amount: Math.abs(Number(recurringTx.amount)), // Luôn dùng số dương, định dạng sẽ được xử lý trong TransactionService
          description: `${recurringTx.description} (Định kỳ)`
        };
        
        // Gọi TransactionService để tạo giao dịch
        const transactionResult = await this.transactionService.createTransaction(
          recurringTx.userId,
          createTransactionDto
        );
        
        // Tính toán ngày xuất hiện tiếp theo
        const nextOccurence = recurringTx.calculateNextOccurrence(recurringTx.next_occurence);
        console.log(nextOccurence)
        
        await this.recurringTxRepository.updateNextOccurrence(
          recurringTx.id, 
          recurringTx.userId, 
          nextOccurence
        );
        
        // Trả về kết quả
        return {
          transactionId: transactionResult.id,
          recurringTransactionId: recurringTx.id,
          amount: Number(transactionResult.amount),
          description: transactionResult.description,
          categoryName: transactionResult.categoryId, // Sửa lại để truy cập đúng thuộc tính
          newBalance: transactionResult.newBalance,
          nextOccurence: nextOccurence
        };
      } catch (error) {
        this.logger.error(`Error processing recurring transaction ${recurringTx.id}: ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * Generate upcoming transactions for a user
   * @param userId User ID
   * @param days Number of days to look ahead
   * @returns Projected upcoming transactions
   */
  async generateUpcomingTransactions(userId: string, days: number = 30): Promise<any[]> {
    // Get all active recurring transactions for the user
    const recurringTransactions = await this.recurringTxRepository.findActiveByUser(userId);
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const upcomingTransactions: any[] = [];
    
    // For each recurring transaction, project occurrences within the date range
    for (const recurringTx of recurringTransactions) {
      let currentDate = new Date(recurringTx.next_occurence);
      
      while (currentDate <= endDate) {
        upcomingTransactions.push({
          recurringTransactionId: recurringTx.id,
          categoryId: recurringTx.categoryId,
          categoryName: recurringTx.category?.name,
          description: recurringTx.description,
          amount: recurringTx.amount,
          frequency: recurringTx.frequency,
          frequencyDescription: recurringTx.getFrequencyDescription(),
          projectedDate: new Date(currentDate),
          type: recurringTx.getTransactionType()
        });
        
        // Calculate next occurrence
        currentDate = recurringTx.calculateNextOccurrence(currentDate);
      }
    }
    
    // Sort by projected date
    upcomingTransactions.sort((a: any, b: any) => 
      a.projectedDate.getTime() - b.projectedDate.getTime()
    );
    
    return upcomingTransactions;
  }

  /**
   * Get financial impact statistics for recurring transactions
   * @param userId User ID
   * @returns Statistics about recurring transactions
   */
  async getRecurringTransactionsStats(userId: string): Promise<any> {
    const recurringTransactions = await this.recurringTxRepository.findActiveByUser(userId);
    
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let annualIncome = 0;
    let annualExpenses = 0;
    
    // Calculate monthly and annual impact
    for (const tx of recurringTransactions) {
      const isIncome = tx.getTransactionType() === TransactionType.INCOME;
      const annualAmount = tx.getAnnualAmount();
      const monthlyAmount = annualAmount / 12;
      
      if (isIncome) {
        monthlyIncome += monthlyAmount;
        annualIncome += annualAmount;
      } else {
        monthlyExpenses += monthlyAmount;
        annualExpenses += annualAmount;
      }
    }
    
    return {
      recurringTransactionsCount: recurringTransactions.length,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlyNet: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
      annualIncome: Math.round(annualIncome * 100) / 100,
      annualExpenses: Math.round(annualExpenses * 100) / 100,
      annualNet: Math.round((annualIncome - annualExpenses) * 100) / 100,
      nextUpcoming: recurringTransactions.length > 0 
        ? recurringTransactions
            .sort((a: RecurringTransaction, b: RecurringTransaction) => 
              a.next_occurence.getTime() - b.next_occurence.getTime()
            )[0]
            .toResponseFormat()
        : null
    };
  }
}
