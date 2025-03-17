import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FamilyInvitationController } from '../controllers/family-invitation.controller';
import { FamilyInvitationService } from '../services/family-invitation.service';
import { PrismaFamilyInvitationRepository } from '../repositories/prisma-family-invitation.repository';
import { FamilyGroupModule } from './family-group.module';
import { CleanupExpiredInvitationsTask } from '../tasks/cleanup-expired-invitations.task';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), FamilyGroupModule],
  controllers: [FamilyInvitationController],
  providers: [
    FamilyInvitationService,
    PrismaFamilyInvitationRepository,
    CleanupExpiredInvitationsTask
  ],
  exports: [FamilyInvitationService]
})
export class FamilyInvitationModule {}
