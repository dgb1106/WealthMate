import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsScheduler {
  private readonly logger = new Logger(BudgetsScheduler.name);
  private isRecalculating = false; // Flag to prevent concurrent executions
  
  constructor(
    private readonly prisma: PrismaService
  ) {}

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

  @Cron('0 0 23 * * *') // Run at 11:00 PM every day
  async recalculateBudgetSpentAmounts() {
    if (this.isRecalculating) {
      this.logger.warn('Budget recalculation already in progress, skipping');
      return;
    }

    this.isRecalculating = true;
    this.logger.log('Starting budget spent amount recalculation');
    
    try {
      // Process personal budgets
      const personalBudgets = await this.prisma.budgets.findMany({
        where: {
          end_date: {
            gte: new Date() // Only active budgets
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });
      
      this.logger.log(`Found ${personalBudgets.length} active personal budgets to recalculate`);
      
      // Process each personal budget
      for (const budget of personalBudgets) {
        try {
          const existingTransactions = await this.prisma.transactions.aggregate({
            where: {
              userId: budget.user.id,
              categoryId: BigInt(budget.categoryId),
              created_at: {
                gte: budget.start_date,
                lte: budget.end_date
              }
            },
            _sum: {
              amount: true
            }
          });

          const spentAmount = existingTransactions._sum.amount || 0;
          await this.prisma.budgets.update({
            where: {
              id: budget.id
            },
            data: {
              spent_amount: spentAmount
            }
          });
          
          this.logger.log(`Updated personal budget ${budget.id} for user ${budget.user.email}: spent amount = ${spentAmount}`);
        } catch (budgetError) {
          // Log error but continue processing other budgets
          this.logger.error(`Error updating personal budget ${budget.id}: ${budgetError.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to recalculate budget spent amounts: ${error.message}`);
      this.logger.error(error.stack);
    } finally {
      this.isRecalculating = false;
    }
  }

  @Cron('0 0 23 * * *') // Run at 11:00 PM every day
  async recalculateFamilyBudgetSpentAmounts() {
    if (this.isRecalculating) {
      this.logger.warn('Budget recalculation already in progress, skipping');
      return;
    }

    this.isRecalculating = true;
    this.logger.log('Starting budget spent amount recalculation');
    
    try {
      // Process personal budgets
      const personalBudgets = await this.prisma.budgets.findMany({
        where: {
          end_date: {
            gte: new Date() // Only active budgets
          }
        },
        include: {
          user: {
            select: {
              id: true,
            }
          }
        }
      });
      
      this.logger.log(`Found ${personalBudgets.length} active personal budgets to recalculate`);
      
      // Process each personal budget
      for (const budget of personalBudgets) {
        try {
          const existingTransactions = await this.prisma.transactions.aggregate({
            where: {
              userId: budget.user.id,
              categoryId: BigInt(budget.categoryId),
              created_at: {
                gte: budget.start_date,
                lte: budget.end_date
              }
            },
            _sum: {
              amount: true
            }
          });

          const spentAmount = existingTransactions._sum.amount || 0;
          await this.prisma.budgets.update({
            where: {
              id: budget.id
            },
            data: {
              spent_amount: spentAmount
            }
          });
          this.logger.log(`Updated personal budget ${budget.id} for user ${budget.user.id}: spent amount = ${spentAmount}`);
        } catch (budgetError) {
          // Log error but continue processing other budgets
          this.logger.error(`Error updating personal budget ${budget.id}: ${budgetError.message}`);
        }
      }

      // Process family budgets
      const familyBudgets = await this.prisma.familyBudgets.findMany({
        where: {
          end_date: {
            gte: new Date() // Only active budgets
          }
        },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      this.logger.log(`Found ${familyBudgets.length} active family budgets to recalculate`);

      // Process each family budget
      for (const budget of familyBudgets) {
        try {
          const existingTransactions = await this.prisma.familyTransactionContributions.aggregate({
            where: {
              groupId: budget.group.id,
              created_at: {
                gte: budget.start_date,
                lte: budget.end_date
              },
              targetId: budget.id
            },
            _sum: {
              amount: true
            }
          });

          const spentAmount = existingTransactions._sum.amount || 0;
          await this.prisma.familyBudgets.update({
            where: {
              id: budget.id
            },
            data: {
              spent_amount: spentAmount
            }
          });
          this.logger.log(`Updated family budget ${budget.id} for group ${budget.group.name}: spent amount = ${spentAmount}`);
        } catch (budgetError) {
          // Log error but continue processing other budgets
          this.logger.error(`Error updating family budget ${budget.id}: ${budgetError.message}`);
        }
      }
    }
    catch (error) {
      this.logger.error(`Failed to recalculate family budget spent amounts: ${error.message}`);
      this.logger.error(error.stack);
    }
    finally {
      this.isRecalculating = false;
    }
}
}