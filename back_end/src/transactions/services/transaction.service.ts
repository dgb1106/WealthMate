import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionRepository } from '../repositories/transaction-repository.interface';
import { TransactionDomainService } from './transaction-domain.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionType } from '../../common/enums/enum';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  // Cache TTL values in seconds
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly SHORT_CACHE_TTL = 60; // 1 minute

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('TRANSACTION_REPOSITORY') private readonly transactionRepository: TransactionRepository, // <-- String token
    private readonly transactionDomainService: TransactionDomainService,
  ) {}

  /**
   * Generate a cache key for a specific user's transactions
   */
  private getCacheKey(userId: string, suffix: string = ''): string {
    return `transactions:${userId}${suffix ? ':' + suffix : ''}`;
  }

  /**
   * Clear all transaction-related cache entries for a user
   */
  private async clearUserTransactionCache(userId: string): Promise<void> {
    await Promise.all([
      this.cacheManager.del(this.getCacheKey(userId)),
      this.cacheManager.del(this.getCacheKey(userId, 'current-month')),
      this.cacheManager.del(this.getCacheKey(userId, 'income')),
      this.cacheManager.del(this.getCacheKey(userId, 'expenses')),
    ]);
  }

  /**
   * Create a new transaction with proper error handling and cache invalidation
   */
  async createTransaction(userId: string, createDto: CreateTransactionDto): Promise<Transaction> {
    this.transactionDomainService.validateAmount(createDto.amount);
    
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find the category
        const category = await this.prisma.categories.findUnique({
          where: { id: BigInt(createDto.categoryId) },
        });

        if (!category) {
          throw new NotFoundException(`Category with ID ${createDto.categoryId} not found`);
        }

        // Calculate the balance effect
        const balanceAdjustment = this.transactionDomainService.calculateBalanceEffect(
          createDto.amount,
          category.type as TransactionType
        );

        // Format the transaction amount based on category type
        const transactionAmount = this.transactionDomainService.formatTransactionAmount(
          createDto.amount,
          category.type as TransactionType
        );

        // Create transaction and update user balance
        const transaction = await this.transactionRepository.create(
          userId,
          createDto.categoryId,
          transactionAmount,
          createDto.description
        );
        
        // Update user balance separately
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: {
            current_balance: {
              increment: balanceAdjustment,
            },
            updated_at: new Date(),
          },
          select: {
            current_balance: true
          }
        });

        // Clear all related caches
        await this.clearUserTransactionCache(userId);

        // Return the transaction with balance information
        return {
          ...transaction,
          newBalance: updatedUser.current_balance
        } as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to create transaction: ${error.message}`);
      }
    });
  }

  /**
   * Get all transactions for a user with caching
   */
  async getAllTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId);
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const transactions = await this.transactionRepository.findAllByUser(userId);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(userId: string, id: string): Promise<Transaction> {
    const cacheKey = this.getCacheKey(userId, `transaction-${id}`);
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const transaction = await this.transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Store in cache with shorter TTL for individual items
    await this.cacheManager.set(cacheKey, transaction, this.SHORT_CACHE_TTL);
    
    return transaction;
  }
  
  /**
   * Get transactions for the current month with caching
   */
  async getCurrentMonthTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'current-month');
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Calculate date range
    const { firstDay, lastDay } = this.transactionDomainService.getCurrentMonthRange();
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllByUserForDateRange(
      userId, 
      firstDay, 
      lastDay
    );
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Get transactions for a specific month and year
   */
  async getTransactionsForMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    // Validate month
    this.transactionDomainService.validateMonth(month);
    
    const cacheKey = this.getCacheKey(userId, `month-${year}-${month}`);
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Calculate date range
    const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(month, year);
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllByUserForDateRange(
      userId,
      firstDay,
      lastDay
    );
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Get transactions for a specific date range
   */
  async getTransactionsForDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    this.transactionDomainService.validateDateRange(startDate, endDate);
    
    const cacheKey = this.getCacheKey(
      userId, 
      `range-${startDate.toISOString().slice(0, 10)}-to-${endDate.toISOString().slice(0, 10)}`
    );
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllByUserForDateRange(
      userId, 
      startDate, 
      endDate
    );
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Get all income transactions for a user
   */
  async getIncomeTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'income');
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllIncomeByUser(userId);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Get all expense transactions for a user
   */
  async getExpenseTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'expenses');
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllExpensesByUser(userId);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Get transactions by category for a user
   */
  async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, `category-${categoryId}`);
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const transactions = await this.transactionRepository.findAllByUserAndCategory(userId, categoryId);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, transactions, this.CACHE_TTL);
    
    return transactions;
  }
  
  /**
   * Update a transaction with proper error handling and cache invalidation
   */
  async updateTransaction(userId: string, id: string, updateDto: UpdateTransactionDto): Promise<Transaction> {
    // If amount is provided, validate it
    if (updateDto.amount !== undefined) {
      this.transactionDomainService.validateAmount(updateDto.amount);
    }
    
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find original transaction
        const originalTransaction = await prisma.transactions.findFirst({
          where: { 
            id: BigInt(id),
            userId 
          },
          include: {
            category: true
          }
        });
        
        if (!originalTransaction) {
          throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        
        // Determine category (original or new)
        const categoryId = updateDto.categoryId 
          ? BigInt(updateDto.categoryId)
          : originalTransaction.categoryId;
        
        const category = await prisma.categories.findUnique({
          where: { id: categoryId }
        });
        
        if (!category) {
          throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }
        
        // Calculate amount change for balance update
        let newAmount = updateDto.amount ?? originalTransaction.amount;
        
        // Format amount based on category type
        newAmount = this.transactionDomainService.formatTransactionAmount(
          newAmount,
          category.type as TransactionType
        );
        
        // Calculate balance adjustment
        const balanceAdjustment = Number(newAmount) - Number(originalTransaction.amount);
        
        // Update user balance
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: {
            current_balance: { increment: balanceAdjustment },
            updated_at: new Date()
          },
          select: { current_balance: true }
        });
        
        // Update transaction
        const updateData: any = {};
        if (updateDto.categoryId) {
          updateData.categoryId = categoryId;
        }
        if (updateDto.amount !== undefined) {
          updateData.amount = newAmount;
        }
        if (updateDto.description !== undefined) {
          updateData.description = updateDto.description;
        }
        
        const updatedTransaction = await this.transactionRepository.update(
          id, 
          userId, 
          updateData
        );
        
        // Clear all related caches
        await this.clearUserTransactionCache(userId);
        await this.cacheManager.del(this.getCacheKey(userId, `transaction-${id}`));
        
        // Return updated transaction with new balance
        return {
          ...updatedTransaction,
          newBalance: updatedUser.current_balance
        } as any;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to update transaction: ${error.message}`);
      }
    });
  }
  
  /**
   * Delete a transaction with proper error handling and cache invalidation
   */
  async deleteTransaction(userId: string, id: string): Promise<any> {
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find transaction to delete
        const transaction = await prisma.transactions.findFirst({
          where: {
            id: BigInt(id),
            userId
          }
        });
        
        if (!transaction) {
          throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        
        // Calculate balance adjustment (reverse of the transaction amount)
        const balanceAdjustment = -transaction.amount;
        
        // Update user balance
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: {
            current_balance: { increment: balanceAdjustment },
            updated_at: new Date()
          },
          select: { current_balance: true }
        });
        
        // Delete the transaction
        await this.transactionRepository.delete(id, userId);
        
        // Clear all related caches
        await this.clearUserTransactionCache(userId);
        await this.cacheManager.del(this.getCacheKey(userId, `transaction-${id}`));
        
        return {
          message: `Transaction with ID ${id} successfully deleted`,
          newBalance: updatedUser.current_balance
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to delete transaction: ${error.message}`);
      }
    });
  }
  
  /**
   * Get transaction summary by category with caching
   */
  async getTransactionSummaryByCategory(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    this.transactionDomainService.validateDateRange(startDate, endDate);
    
    const cacheKey = this.getCacheKey(
      userId, 
      `summary-${startDate.toISOString().slice(0, 10)}-to-${endDate.toISOString().slice(0, 10)}`
    );
    
    // Try to get from cache
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const summary = await this.transactionRepository.getSummaryByCategory(userId, startDate, endDate);
    
    // Store in cache
    await this.cacheManager.set(cacheKey, summary, this.CACHE_TTL);
    
    return summary;
  }

  async getCategoryTotal(userId: string, categoryId: string): Promise<number> {

    const category = await this.prisma.categories.findUnique({
      where: { id: BigInt(categoryId) },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    
    const totalAmount = await this.transactionRepository.getTotalAmountByCategoryForUser(userId, categoryId);
    return totalAmount;
  }
}
