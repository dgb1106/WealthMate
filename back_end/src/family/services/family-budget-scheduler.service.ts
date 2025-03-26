import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { ContributionType } from '../../common/enums/enum';

@Injectable()
export class FamilyBudgetSchedulerService {
  private readonly logger = new Logger(FamilyBudgetSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly familyBudgetRepository: PrismaFamilyBudgetRepository,
  ) {}

  /**
   * Cron job that runs every night at midnight to update all active budgets
   * with their accurate spent amounts based on contributions
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAllActiveBudgets() {
    try {
      this.logger.log('Starting scheduled update of all active budgets');
      
      // Get all active budgets
      const today = new Date();
      const activeBudgets = await this.prisma.familyBudgets.findMany({
        where: {
          start_date: { lte: today },
          end_date: { gte: today }
        },
        include: {
          category: true
        }
      });
      
      this.logger.log(`Found ${activeBudgets.length} active budgets to update`);
      
      // Process each budget
      for (const budget of activeBudgets) {
        try {
          const budgetId = String(budget.id);
          const groupId = String(budget.groupId);
          const categoryId = String(budget.categoryId);
          
          // Calculate accurate spent amount for this budget
          const totalSpent = await this.calculateTotalSpent(
            groupId,
            categoryId,
            budget.start_date,
            budget.end_date
          );
          
          // Only update if the amount has changed
          if (Number(budget.spent_amount) !== totalSpent) {
            await this.prisma.familyBudgets.update({
              where: { id: budget.id },
              data: { spent_amount: totalSpent }
            });
            
            this.logger.log(
              `Updated budget ${budgetId} for ${budget.category.name}: ${budget.spent_amount} → ${totalSpent}`
            );
          }
        } catch (error) {
          this.logger.error(`Failed to update budget ${budget.id}:`, error);
          // Continue with next budget even if one fails
        }
      }
      
      this.logger.log('Completed scheduled update of all active budgets');
    } catch (error) {
      this.logger.error('Error during scheduled budget update:', error);
    }
  }

  /**
   * Manually trigger an update of all active budgets
   */
  async manualUpdateAllActiveBudgets() {
    await this.updateAllActiveBudgets();
    return { success: true, message: 'All active budgets have been updated' };
  }

  /**
   * Calculates the total amount spent from contributions for a category and group
   * within a specific date range
   */
  private async calculateTotalSpent(
    groupId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Find all budget contributions that match the group and category within the date range
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: {
        groupId: BigInt(groupId),
        contributionType: ContributionType.BUDGET,
        transaction: {
          categoryId: BigInt(categoryId),
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        transaction: true
      }
    });

    // Sum up all the contribution amounts
    const totalSpent = contributions.reduce((sum, contribution) => {
      return sum + Number(contribution.amount);
    }, 0);

    return totalSpent;
  }
}
