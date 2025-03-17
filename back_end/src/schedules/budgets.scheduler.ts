import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsScheduler {
  private readonly logger = new Logger(BudgetsScheduler.name);
  
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
      
      // Find and delete all budgets where end_date has passed
      const result = await this.prisma.budgets.deleteMany({
        where: {
          end_date: {
            lt: today
          }
        }
      });
      
      this.logger.log(`Successfully cleaned up ${result.count} expired budgets`);
    } catch (error) {
      this.logger.error(`Failed to clean up expired budgets: ${error.message}`);
      this.logger.error(error.stack);
    }
  }
}
