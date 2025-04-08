import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetsService } from '../budgets/budgets.service';

@Injectable()
export class BudgetsScheduler {
  private readonly logger = new Logger(BudgetsScheduler.name);
  private isProcessing = false;
  
  constructor(
    private readonly budgetsService: BudgetsService,
    private readonly prisma: PrismaService
  ) {
    this.logger.log('BudgetSchedulerService initialized');
  }

  /**
   * Run every day at 1:00 AM to clean up expired budgets
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupExpiredBudgets() {
    this.logger.log('Starting expired budgets cleanup process');
    
    try {
      const today = new Date();
      
      // Find and delete all personal budgets where end_date has passed
      const personalResult = await this.prisma.budgets.deleteMany({
        where: {
          end_date: {
            lt: today
          }
        }
      });
      
      const expiredFamilyBudgets = await this.prisma.familyBudgets.findMany({
        where: {
          end_date: {
            lt: today
          }
        },
        include: {
          group: {
            select: {
              name: true
            }
          }
        }
      });
      
      this.logger.log(`Deleted ${personalResult.count} personal budgets`);
      this.logger.log(`Found ${expiredFamilyBudgets.length} expired family budgets`);
      this.logger.log(expiredFamilyBudgets);
    } catch (error) {
      this.logger.error(`Failed to clean up expired budgets: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  /**
   * Daily job to update all budget spent amounts based on actual transactions
   * Runs every day at 3:00 AM to avoid conflicts with other schedulers
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateAllBudgetsSpentAmounts() {
    if (this.isProcessing) {
      this.logger.warn('Budget update already in progress, skipping');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting daily budget spent amount update');
    
    try {
      await this.updatePersonalBudgets();
      await this.updateFamilyBudgets();
      this.logger.log('Completed daily budget spent amount update');
    } catch (error) {
      this.logger.error(`Failed to update budgets: ${error.message}`, error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

   /**
   * Update all active personal budgets
   */
   private async updatePersonalBudgets(): Promise<void> {
    try {
      // Get all active personal budgets
      const personalBudgets = await this.budgetsService.getCurrentBudgets('all');
      
      this.logger.log(`Found ${personalBudgets.length} active personal budgets to update`);
      
      // Process each personal budget
      for (const budget of personalBudgets) {
        try {
          const spentAmount = await this.calculatePersonalBudgetSpentAmount(
            budget.userId,
            budget.categoryId,
            budget.start_date,
            budget.end_date
          );
          
          if (spentAmount === undefined) {
            this.logger.warn(`Spent amount for budget ${budget.id} is undefined`);
            continue;
          }

          if (spentAmount !== Number(budget.spent_amount)) {
            await this.budgetsService.updateBudgetWithCalculatedAmount(
              budget.id,
              budget.userId,
              spentAmount
            );
          }
          
          this.logger.debug(
            `Updated personal budget ${budget.id} for user ${budget.userId}: spent amount = ${spentAmount}`
          );
        } catch (error) {
          this.logger.error(
            `Error updating personal budget ${budget.id}: ${error.message}`, 
            error.stack
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update personal budgets: ${error.message}`, error.stack);
    }
  }

  private async updateFamilyBudgets(): Promise<void> {
    try {
      // Get all active family budgets
      const familyBudgets = await this.prisma.familyBudgets.findMany({
        where: {
          end_date: {
            lt: new Date()
          }
        }
      });
      
      this.logger.log(`Found ${familyBudgets.length} active family budgets to update`);
      
      // Process each family budget
      for (const budget of familyBudgets) {
        try {
          const spentAmount = await this.calculateFamilyBudgetSpentAmount(
            budget.groupId.toString(),
            budget.id.toString(),
            budget.start_date,
            budget.end_date
          );
          
          if (spentAmount === undefined) {
            this.logger.warn(`Spent amount for family budget ${budget.id} is undefined`);
            continue;
          }

          if (spentAmount !== Number(budget.spent_amount)) {
            await this.prisma.familyBudgets.update({
              where: {
                id: budget.id
              },
              data: {
                spent_amount: spentAmount
              }
            });
          }
          
          this.logger.debug(
            `Updated family budget ${budget.id} for group ${budget.groupId}: spent amount = ${spentAmount}`
          );
        } catch (error) {
          this.logger.error(
            `Error updating family budget ${budget.id}: ${error.message}`, 
            error.stack
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update family budgets: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculates the total spent amount from transactions for a personal budget
   */
  private async calculatePersonalBudgetSpentAmount(
    userId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
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

    return transactions._sum.amount ? Math.abs(Number(transactions._sum.amount)) : 0;
  }

  /**
   * Calculates the total spent amount from transactions for a family budget
   */
  private async calculateFamilyBudgetSpentAmount(
    groupId: string,
    budgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const contributions = await this.prisma.familyTransactionContributions.aggregate({
      where: {
        groupId: BigInt(groupId),
        created_at: {
          gte: startDate,
          lte: endDate
        },
        targetId: BigInt(budgetId)
      },
      _sum: {
        amount: true
      }
    });

    return contributions._sum.amount ? Math.abs(Number(contributions._sum.amount)) : 0;
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

