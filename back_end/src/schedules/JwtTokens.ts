import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtTokensScheduler {
  private readonly logger = new Logger(JwtTokensScheduler.name);
  
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * Run every day at 2:00 AM to clean up expired JWT tokens
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredJwtTokens() {
    this.logger.log('Starting expired JWT tokens cleanup process');
    
    try {
      const now = new Date();
      
      // Find and delete all JWT tokens where expires_at has passed
      const result = await this.prisma.jWT.deleteMany({
        where: {
          expires_at: {
            lt: now
          }
        }
      });
      
      this.logger.log(`Successfully cleaned up ${result.count} expired JWT tokens`);
    } catch (error) {
      this.logger.error(`Failed to clean up expired JWT tokens: ${error.message}`);
      this.logger.error(error.stack);
    }
  }
}
