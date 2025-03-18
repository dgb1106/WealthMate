import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FamilyInvitationService } from '../services/family-invitation.service';

@Injectable()
export class CleanupExpiredInvitationsTask {
  private readonly logger = new Logger(CleanupExpiredInvitationsTask.name);

  constructor(
    private readonly familyInvitationService: FamilyInvitationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanupExpiredInvitations() {
    this.logger.log('Running cleanup of expired family group invitations');
    try {
      const count = await this.familyInvitationService.cleanupExpiredInvitations();
      this.logger.log(`Marked ${count} expired invitations`);
    } catch (error) {
      this.logger.error(`Failed to clean up expired invitations: ${error.message}`);
    }
  }
}
