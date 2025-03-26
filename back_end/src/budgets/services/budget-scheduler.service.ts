import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BudgetRepository } from '../repositories/budget-repository.interface';
import { BudgetsService } from '../budgets.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetSchedulerService {
  private readonly logger = new Logger(BudgetSchedulerService.name);

  constructor(
    @Inject('BudgetRepository')
    private readonly budgetRepository: BudgetRepository,
    private readonly budgetsService: BudgetsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Daily job to update all budget spent amounts based on actual transactions
   * Runs every day at 3:00 AM to avoid conflicts with other schedulers
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateAllBudgetsSpentAmounts() {
    this.logger.log('Starting daily budget spent amount update');
    
    try {
      // Get all active budgets
      const today = new Date();
      const activeBudgets = await this.budgetRepository.getCurrentBudgets('all');
      
      this.logger.log(`Found ${activeBudgets.length} active budgets to update`);
      
      // Process each budget
      for (const budget of activeBudgets) {
        try {
          // Calculate total spent amount from transactions
          const calculatedTotal = await this.calculateTotalSpentFromTransactions(
            budget.userId,
            budget.categoryId,
            budget.start_date,
            budget.end_date
          );
          
          // Only update if the amount is different
          if (calculatedTotal !== budget.spent_amount) {
            await this.budgetsService.updateBudgetWithCalculatedAmount(
              budget.id,
              budget.userId,
              calculatedTotal
            );
            
            this.logger.debug(
              `Updated budget ${budget.id} for user ${budget.userId}, ` +
              `category ${budget.categoryId}: ${budget.spent_amount} → ${calculatedTotal}`
            );
          }
        } catch (error) {
          this.logger.error(
            `Error updating budget ${budget.id} for user ${budget.userId}: ${error.message}`,
            error.stack
          );
        }
      }
      
      this.logger.log('Completed daily budget spent amount update');
    } catch (error) {
      this.logger.error(`Failed to update budgets: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculates the total spent amount from transactions for a specific budget
   */
  private async calculateTotalSpentFromTransactions(
    userId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get all relevant transactions
    const transactions = await this.prisma.transactions.aggregate({
      where: {
        userId,
        categoryId: BigInt(categoryId),
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    // Return the sum of amounts or 0 if no transactions found
    const totalAmount = transactions._sum.amount ? Math.abs(Number(transactions._sum.amount)) : 0;
    return totalAmount;
  }

  /**
   * Manually trigger budget update for testing or admin functions
   */
  async manualUpdateAllBudgets(): Promise<{ success: boolean; message: string }> {
    await this.updateAllBudgetsSpentAmounts();
    return { 
      success: true, 
      message: 'All budget spent amounts have been updated based on transaction totals' 
    };
  }
}
