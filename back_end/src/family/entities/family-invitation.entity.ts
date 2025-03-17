import { Type } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { FamilyGroup } from './family-group.entity';
import { InvitationStatus } from '../../common/enums/enum';

export class FamilyInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeEmail: string;
  status: InvitationStatus;
  created_at: Date;
  expires_at: Date;
  
  @Type(() => FamilyGroup)
  group?: FamilyGroup;
  
  @Type(() => User)
  inviter?: User;
  
  constructor(partial: Partial<FamilyInvitation>) {
    Object.assign(this, partial);
  }
  
  /**
   * Check if the invitation is pending
   */
  isPending(): boolean {
    return this.status === InvitationStatus.PENDING;
  }
  
  /**
   * Check if the invitation has been accepted
   */
  isAccepted(): boolean {
    return this.status === InvitationStatus.ACCEPTED;
  }
  
  /**
   * Check if the invitation has been rejected
   */
  isRejected(): boolean {
    return this.status === InvitationStatus.REJECTED;
  }
  
  /**
   * Check if the invitation has expired
   */
  isExpired(): boolean {
    return this.status === InvitationStatus.EXPIRED || new Date() > this.expires_at;
  }
  
  /**
   * Check if the invitation is valid and can be accepted
   */
  isValid(): boolean {
    return this.isPending() && !this.isExpired();
  }
  
  /**
   * Accept the invitation
   */
  accept(): void {
    if (!this.isValid()) {
      throw new Error('Invitation is no longer valid');
    }
    this.status = InvitationStatus.ACCEPTED;
  }
  
  /**
   * Reject the invitation
   */
  reject(): void {
    if (!this.isPending()) {
      throw new Error('Invitation cannot be rejected');
    }
    this.status = InvitationStatus.REJECTED;
  }
  
  /**
   * Convert a Prisma family invitation to a FamilyInvitation entity
   */
  static fromPrisma(prismaFamilyInvitation: any): FamilyInvitation {
    return new FamilyInvitation({
      id: String(prismaFamilyInvitation.id),
      groupId: String(prismaFamilyInvitation.groupId),
      inviterId: prismaFamilyInvitation.inviterId,
      inviteeEmail: prismaFamilyInvitation.inviteeEmail,
      status: prismaFamilyInvitation.status,
      created_at: new Date(prismaFamilyInvitation.created_at),
      expires_at: new Date(prismaFamilyInvitation.expires_at),
      group: prismaFamilyInvitation.group 
        ? FamilyGroup.fromPrisma(prismaFamilyInvitation.group)
        : undefined,
      inviter: prismaFamilyInvitation.inviter
        ? new User(prismaFamilyInvitation.inviter)
        : undefined
    });
  }
  
  /**
   * Convert multiple Prisma family invitations to entities
   */
  static fromPrismaArray(prismaFamilyInvitations: any[]): FamilyInvitation[] {
    return prismaFamilyInvitations.map(invitation => FamilyInvitation.fromPrisma(invitation));
  }
  
  /**
   * Format the family invitation for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      groupId: this.groupId,
      groupName: this.group?.name,
      inviterId: this.inviterId,
      inviterName: this.inviter?.name,
      inviteeEmail: this.inviteeEmail,
      status: this.status,
      created_at: this.created_at.toISOString(),
      expires_at: this.expires_at.toISOString(),
      isValid: this.isValid(),
      isExpired: this.isExpired()
    };
  }
}
