import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyInvitationRepository } from '../repositories/prisma-family-invitation.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyInvitation } from '../entities/family-invitation.entity';
import { CreateFamilyInvitationDto } from '../dto/create-family-invitation.dto';

@Injectable()
export class FamilyInvitationService {
  constructor(
    private readonly familyInvitationRepository: PrismaFamilyInvitationRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
  ) {}

  async create(
    userId: string,
    groupId: string,
    createInvitationDto: CreateFamilyInvitationDto,
  ): Promise<FamilyInvitation> {
    // The repository method already checks if the user has permission to invite
    return this.familyInvitationRepository.create(userId, groupId, createInvitationDto);
  }

  async findAll(groupId: string, userId: string): Promise<FamilyInvitation[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view invitations for this group');
    }
    
    return this.familyInvitationRepository.findAll(groupId);
  }

  async findOne(id: string, userId: string): Promise<FamilyInvitation> {
    const invitation = await this.familyInvitationRepository.findOne(id);
    
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    // Check if user is a member of this group or is the invitee
    const isMember = await this.familyMemberRepository.isGroupMember(userId, invitation.groupId);
    if (!isMember && invitation.inviteeEmail !== userId) {
      throw new BadRequestException('You do not have permission to view this invitation');
    }

    return invitation;
  }

  async findMyInvitations(email: string): Promise<FamilyInvitation[]> {
    return this.familyInvitationRepository.findByEmail(email);
  }

  async acceptInvitation(id: string, userId: string): Promise<void> {
    return this.familyInvitationRepository.acceptInvitation(id, userId);
  }

  async rejectInvitation(id: string, email: string): Promise<void> {
    const invitation = await this.familyInvitationRepository.findOne(id);
    
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }
    
    // Verify the invitation is for this user
    if (invitation.inviteeEmail.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException('This invitation is not for you');
    }

    return this.familyInvitationRepository.rejectInvitation(id);
  }

  async cancelInvitation(id: string, userId: string): Promise<void> {
    return this.familyInvitationRepository.cancelInvitation(id, userId);
  }

  async cleanupExpiredInvitations(): Promise<number> {
    return this.familyInvitationRepository.cleanupExpiredInvitations();
  }
}
