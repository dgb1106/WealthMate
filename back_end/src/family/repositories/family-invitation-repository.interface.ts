import { FamilyInvitation } from '../entities/family-invitation.entity';
import { CreateFamilyInvitationDto } from '../dto/create-family-invitation.dto';

export interface FamilyInvitationRepository {
  create(userId: string, groupId: string, createInvitationDto: CreateFamilyInvitationDto): Promise<FamilyInvitation>;
  findAll(groupId: string): Promise<FamilyInvitation[]>;
  findOne(id: string): Promise<FamilyInvitation | null>;
  findByEmail(email: string): Promise<FamilyInvitation[]>;
  acceptInvitation(id: string, userId: string): Promise<void>;
  rejectInvitation(id: string): Promise<void>;
  cancelInvitation(id: string, userId: string): Promise<void>;
  markAsExpired(id: string): Promise<void>;
  cleanupExpiredInvitations(): Promise<number>;
  findPendingInvitationByEmailAndGroup(email: string, groupId: string): Promise<FamilyInvitation | null>;
}
