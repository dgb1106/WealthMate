import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransactionDomainService } from '../recurring-transactions/services/recurring-transaction-domain.service';

@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);
  
  constructor(
    private recurringTxDomainService: RecurringTransactionDomainService
  ) {
    this.logger.warn('RecurringTransactionsScheduler initialized');
  }

  /**
   * Run every day at midnight to process recurring transactions
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRecurringTransactions() {
    this.logger.log('Starting daily recurring transactions processing');
    
    try {
      const result = await this.recurringTxDomainService.processDueTransactions();
      
      this.logger.log(`Successfully processed ${result.processedCount} recurring transactions`);
      
      if (result.errors.length > 0) {
        this.logger.warn(`Encountered ${result.errors.length} errors during processing`);
        result.errors.forEach(error => this.logger.error(error));
      }
    } catch (error) {
      this.logger.error(`Failed to process recurring transactions: ${error.message}`);
    }
  }
}
