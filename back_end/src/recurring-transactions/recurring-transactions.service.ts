import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { RecurringTransactionRepository } from './repositories/recurring-transaction-repository.interface';
import { RecurringTransactionDomainService } from './services/recurring-transaction-domain.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { Frequency } from './../common/enums/enum';

@Injectable()
export class RecurringTransactionService {
  constructor(
    @Inject('RecurringTransactionRepository')
    private readonly recurringTxRepository: RecurringTransactionRepository,
    private readonly recurringTxDomainService: RecurringTransactionDomainService
  ) {}

  /**
   * Creates a new recurring transaction
   */
  async create(userId: string, createDto: CreateRecurringTransactionDto) {
    try {
      // Validate the recurring transaction data
      this.recurringTxDomainService.validateRecurringTransactionData(createDto);

      // Create via repository
      const transaction = await this.recurringTxRepository.create(userId, createDto);
      
      // Return formatted result
      return transaction.toResponseFormat();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create recurring transaction: ${error.message}`);
    }
  }

  /**
   * Find all recurring transactions for a user
   */
  async findAll(userId: string) {
    const transactions = await this.recurringTxRepository.findAll(userId);
    return transactions.map(tx => tx.toResponseFormat());
  }

  /**
   * Find a specific recurring transaction by ID
   */
  async findOne(id: string, userId: string) {
    const transaction = await this.recurringTxRepository.findById(id, userId);
    
    if (!transaction) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    return transaction.toResponseFormat();
  }

  /**
   * Update a recurring transaction
   */
  async update(id: string, userId: string, updateDto: UpdateRecurringTransactionDto) {
    try {
      // If next_occurence date is provided, validate it's in the future
      if (updateDto.next_occurence) {
        const nextOccurence = new Date(updateDto.next_occurence);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (nextOccurence < today) {
          throw new BadRequestException('Next occurrence date must be in the future');
        }
      }
      
      // Update via repository
      const transaction = await this.recurringTxRepository.update(id, userId, updateDto);
      
      return transaction.toResponseFormat();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update recurring transaction: ${error.message}`);
    }
  }

  /**
   * Delete a recurring transaction
   */
  async remove(id: string, userId: string) {
    try {
      const result = await this.recurringTxRepository.delete(id, userId);
      return { success: result, message: 'Recurring transaction successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete recurring transaction: ${error.message}`);
    }
  }

  /**
   * Find recurring transactions by frequency
   */
  async findByFrequency(userId: string, frequency: Frequency) {
    const transactions = await this.recurringTxRepository.findByFrequency(userId, frequency);
    return transactions.map(tx => tx.toResponseFormat());
  }

  /**
   * Find recurring transactions by category
   */
  async findByCategory(userId: string, categoryId: string) {
    const transactions = await this.recurringTxRepository.findByCategory(userId, categoryId);
    return transactions.map(tx => tx.toResponseFormat());
  }

  /**
   * Get upcoming transactions within a specified number of days
   */
  async getUpcomingTransactions(userId: string, days: number = 30) {
    const transactions = await this.recurringTxRepository.getUpcomingTransactions(userId, days);
    return transactions.map(tx => tx.toResponseFormat());
  }

  /**
   * Process all due recurring transactions
   */
  async processDueTransactions() {
    return this.recurringTxDomainService.processDueTransactions();
  }

  /**
   * Process a specific recurring transaction
   */
  async processTransaction(id: string, userId: string) {
    const transaction = await this.recurringTxRepository.findById(id, userId);
    
    if (!transaction) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    return this.recurringTxDomainService.processTransaction(transaction);
  }

  /**
   * Generate forecast of upcoming transactions over a period
   */
  async generateTransactionForecast(userId: string, days: number = 30) {
    return this.recurringTxDomainService.generateUpcomingTransactions(userId, days);
  }

  /**
   * Get statistics about recurring transactions
   */
  async getRecurringTransactionStats(userId: string) {
    return this.recurringTxDomainService.getRecurringTransactionsStats(userId);
  }

  /**
   * Skip the next occurrence of a recurring transaction
   */
  async skipNextOccurrence(id: string, userId: string) {
    const transaction = await this.recurringTxRepository.findById(id, userId);
    
    if (!transaction) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    // Calculate the next occurrence date after the current next_occurence
    const nextOccurence = transaction.calculateNextOccurrence();
    
    // Update in repository
    const updatedTransaction = await this.recurringTxRepository.updateNextOccurrence(
      id,
      userId,
      nextOccurence
    );
    
    return updatedTransaction.toResponseFormat();
  }
}
