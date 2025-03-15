import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from './../prisma/prisma.service';
import { TransactionDomainService } from './services/transaction-domain.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from './../common/enums/enum';
import { Transaction } from './entities/transaction.entity';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { UsersService } from 'src/users/services/users.service';
import { UserDomainService } from '../users/services/user-domain.service';

@Injectable()
export class TransactionService {
  // Cache TTL values in seconds
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly SHORT_CACHE_TTL = 60; // 1 minute

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly transactionDomainService: TransactionDomainService,
    private readonly usersService: UsersService,
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
    const keysToDelete = [
      this.getCacheKey(userId),
      this.getCacheKey(userId, 'current-month'),
      this.getCacheKey(userId, 'income'),
      this.getCacheKey(userId, 'expenses'),
    ];
    
    // Delete all cached keys in parallel
    await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));
  }

  /**
   * Generic method to fetch data from cache or repository with caching
   * @param cacheKey Cache key
   * @param fetchFn Function to fetch data if cache miss
   * @param ttl Cache TTL in seconds
   * @returns Data from cache or repository
   */
  private async getFromCacheOrFetch<T>(
    cacheKey: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.cacheManager.get<T>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Fetch from repository
    const data = await fetchFn();
    
    // Store in cache
    await this.cacheManager.set(cacheKey, data, ttl);
    
    return data;
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
        const updatedUser = await this.usersService.increaseBalance(userId, balanceAdjustment);

        // Clear all related caches
        await this.clearUserTransactionCache(userId);

        // Return the transaction with balance information
        return {
          ...transaction,
          newBalance: updatedUser.currentBalance
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
    return this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findAllByUser(userId)
    );
  }

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(userId: string, id: string): Promise<Transaction> {
    const cacheKey = this.getCacheKey(userId, `transaction-${id}`);
    
    const transaction = await this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findById(id, userId),
      this.SHORT_CACHE_TTL
    );

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }
  
  /**
   * Get transactions for the current month with caching
   */
  async getCurrentMonthTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'current-month');
    
    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getCurrentMonthRange();
        return this.transactionRepository.findAllByUserForDateRange(userId, firstDay, lastDay);
      }
    );
  }
  
  /**
   * Get transactions for a specific month and year
   */
  async getTransactionsForMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    // Validate month
    this.transactionDomainService.validateMonth(month);
    
    const cacheKey = this.getCacheKey(userId, `month-${year}-${month}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(month, year);
        return this.transactionRepository.findAllByUserForDateRange(userId, firstDay, lastDay);
      }
    );
  }
  
  /**
   * Get all income transactions for a user
   */
  async getAllIncomeTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'income');
    
    return this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findAllIncomeByUser(userId)
    );
  }

  /**
   * Get all income transactions for current month
   */
  async getCurrentMonthIncomeTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'income-current-month');

    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getCurrentMonthRange();
        return this.transactionRepository.findAllIncomeByUserForDateRange(
          userId, firstDay, lastDay
        );
      }
    );
  }

  /**
   * Get all income transactions for a month
   */
  async getIncomeTransactionsForMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    // Validate month
    this.transactionDomainService.validateMonth(month);
    
    const cacheKey = this.getCacheKey(userId, `income-${year}-${month}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(month, year);
        return this.transactionRepository.findAllIncomeByUserForDateRange(
          userId, firstDay, lastDay
        );
      }
    );
  }
  
  /**
   * Get all expense transactions for a user
   */
  async getAllExpenseTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'expenses');
    
    return this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findAllExpensesByUser(userId)
    );
  }

  /**
   * Get all expense transactions for a month
   */
  async getCurrentMonthExpenseTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, 'expense-current-month');

    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getCurrentMonthRange();
        return this.transactionRepository.findAllExpensesByUserForDateRange(
          userId, firstDay, lastDay
        );
      }
    );
  }

  /**
   * Get all expense transactions for a month
   */
  async getExpenseTransactionsForMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    // Validate month
    this.transactionDomainService.validateMonth(month);
    
    const cacheKey = this.getCacheKey(userId, `expenses-${year}-${month}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(month, year);
        return this.transactionRepository.findAllExpensesByUserForDateRange(
          userId, firstDay, lastDay
        );
      }
    );
  }
  
  /**
   * Get transactions by category for a user
   */
  async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, `category-${categoryId}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findAllByUserAndCategory(userId, categoryId)
    );
  }

  /**
   * Get transactions by category for a user for current month
   */
  async getCurrentMonthTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    const cacheKey = this.getCacheKey(userId, `category-${categoryId}-current-month`);

    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getCurrentMonthRange();
        return this.transactionRepository.findAllByUserAndCategoryForDateRange(
          userId, categoryId, firstDay, lastDay
        );
      }
    );
  }

  /**
   * Get transactions by category for a user for specific month
   */
  async getTransactionsByCategoryForMonth(
    userId: string, 
    categoryId: string, 
    month: number, 
    year: number
  ): Promise<Transaction[]> {
    // Validate month
    this.transactionDomainService.validateMonth(month);
    
    const cacheKey = this.getCacheKey(userId, `category-${categoryId}-${year}-${month}`);

    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(Number(month), Number(year));
        return this.transactionRepository.findAllByUserAndCategoryForDateRange(
          userId, categoryId, firstDay, lastDay
        );
      }
    );
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
        const updatedUser = await this.usersService.updateBalance(userId, balanceAdjustment);
        
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
          newBalance: updatedUser.currentBalance
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
        const balanceAdjustment = -Number(transaction.amount);
        
        // Update user balance
        const updatedUser = await this.usersService.increaseBalance(userId, balanceAdjustment);
        
        // Delete the transaction
        await this.transactionRepository.delete(id, userId);
        
        // Clear all related caches
        await this.clearUserTransactionCache(userId);
        await this.cacheManager.del(this.getCacheKey(userId, `transaction-${id}`));
        
        return {
          message: `Transaction with ID ${id} successfully deleted`,
          newBalance: updatedUser.currentBalance
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
   * Get transaction summary by category for month with caching
   */
  async getTransactionSummaryByCategoryForMonth(userId: string, month: string, year: string): Promise<any[]> {
    // Validate month
    this.transactionDomainService.validateMonth(Number(month));
    
    const cacheKey = this.getCacheKey(userId, `summary-${year}-${month}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        const { firstDay, lastDay } = this.transactionDomainService.getMonthRange(Number(month), Number(year));
        return this.transactionRepository.getSummaryByCategoryForDateRange(userId, firstDay, lastDay);
      }
    );
  }

  async getTotalAmountByCategoryForUserForDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    categoryId: string
  ): Promise<number> {
    return this.transactionRepository.getTotalAmountByCategoryForUserForDateRange(
      userId, startDate, endDate, categoryId
    );
  }
  
  /**
   * Get transactions for a date range
   */
  async getTransactionsForDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    // Validate date range
    this.transactionDomainService.validateDateRange(startDate, endDate);
    
    const dateKey = `${startDate.toISOString()}-${endDate.toISOString()}`.replace(/[:.]/g, '_');
    const cacheKey = this.getCacheKey(userId, `date-range-${dateKey}`);
    
    return this.getFromCacheOrFetch(
      cacheKey,
      () => this.transactionRepository.findAllByUserForDateRange(userId, startDate, endDate)
    );
  }
}