import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RecurringTransactionRepository } from '../repositories/recurring-transaction-repository.interface';
import { RecurringTransaction } from '../entities/recurring-transaction.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { Frequency, TransactionType } from '../../common/enums/enum';
import { CreateRecurringTransactionDto } from '../dto/create-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionDomainService {
  constructor(
    private readonly recurringTxRepository: RecurringTransactionRepository,
    private readonly prisma: PrismaService
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
  async processDueTransactions(): Promise<{ processedCount: number; transactions: any[] }> {
    const today = new Date();
    const dueTransactions = await this.recurringTxRepository.findDueTransactions(today);
    const createdTransactions: any[] = [];
    
    for (const recurringTx of dueTransactions) {
      const result = await this.processTransaction(recurringTx);
      if (result) {
        createdTransactions.push(result);
      }
    }
    
    return {
      processedCount: createdTransactions.length,
      transactions: createdTransactions
    };
  }

  /**
   * Process a single recurring transaction
   * @param recurringTx Recurring transaction to process
   * @returns Created transaction or null if processing failed
   */
  async processTransaction(recurringTx: RecurringTransaction): Promise<any> {
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Get category to determine transaction type
        const category = await prisma.categories.findUnique({
          where: { id: BigInt(recurringTx.categoryId) }
        });
        
        if (!category) {
          throw new NotFoundException(`Category with ID ${recurringTx.categoryId} not found`);
        }
        
        // Create the transaction instance
        const txData = recurringTx.createTransactionInstance();
        
        const transaction = await prisma.transactions.create({
          data: {
            userId: txData.userId || '',
            categoryId: BigInt(txData.categoryId || '0'),
            amount: txData.amount || 0,
            description: txData.description || '',
            created_at: txData.created_at || new Date()
          }
        });
        
        // Update user balance
        const balanceAdjustment = category.type === TransactionType.INCOME 
          ? Math.abs(Number(recurringTx.amount)) 
          : -Math.abs(Number(recurringTx.amount));
        
        await prisma.users.update({
          where: { id: recurringTx.userId },
          data: {
            current_balance: { increment: balanceAdjustment }
          }
        });
        
        // Calculate next occurrence and update recurring transaction
        const nextOccurence = recurringTx.calculateNextOccurrence();
        
        await prisma.recurringTransactions.update({
          where: { id: BigInt(recurringTx.id) },
          data: {
            next_occurence: nextOccurence
          }
        });
        
        return {
          transactionId: String(transaction.id),
          recurringTransactionId: recurringTx.id,
          amount: Number(transaction.amount),
          nextOccurence: nextOccurence
        };
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurringTx.id}:`, error);
        return null;
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
