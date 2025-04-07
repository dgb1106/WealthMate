import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FamilyInvitationService } from '../services/family-invitation.service';
@Injectable()
export class CleanupExpiredInvitationsTask {
  private readonly logger = new Logger(CleanupExpiredInvitationsTask.name);
  private isProcessing = false;  // Add this flag

  constructor(
    private readonly familyInvitationService: FamilyInvitationService,
  ) {
    this.logger.log('CleanupExpiredInvitationsTask initialized'); // Add this log
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanupExpiredInvitations() {
    if (this.isProcessing) {
      this.logger.warn('Cleanup already in progress, skipping');
      return;
    }
    
    try {
      this.isProcessing = true;
      this.logger.log('Running cleanup of expired family group invitations');
      const count = await this.familyInvitationService.cleanupExpiredInvitations();
      this.logger.log(`Marked ${count} expired invitations`);
    } catch (error) {
      this.logger.error(`Failed to clean up expired invitations: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
