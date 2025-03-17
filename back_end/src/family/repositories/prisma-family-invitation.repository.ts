import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyInvitationRepository } from './family-invitation-repository.interface';
import { FamilyInvitation } from '../entities/family-invitation.entity';
import { CreateFamilyInvitationDto } from '../dto/create-family-invitation.dto';
import { InvitationStatus, FamilyMemberRole } from '../../common/enums/enum';

@Injectable()
export class PrismaFamilyInvitationRepository implements FamilyInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, groupId: string, createInvitationDto: CreateFamilyInvitationDto): Promise<FamilyInvitation> {
    // Check if the inviter is a member of the group with appropriate permissions
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: BigInt(groupId),
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (!member) {
      throw new BadRequestException('You do not have permission to invite members to this group');
    }

    // Check if there's already an active invitation for this email in this group
    const existingInvitation = await this.prisma.familyInvitations.findFirst({
      where: {
        groupId: BigInt(groupId),
        inviteeEmail: createInvitationDto.inviteeEmail,
        status: InvitationStatus.PENDING
      }
    });

    if (existingInvitation) {
      throw new ConflictException('An invitation has already been sent to this email for this group');
    }

    // Check if user is already a member of the group
    const existingUser = await this.prisma.users.findFirst({
      where: { email: createInvitationDto.inviteeEmail }
    });

    if (existingUser) {
      const existingMember = await this.prisma.familyMembers.findFirst({
        where: {
          userId: existingUser.id,
          groupId: BigInt(groupId)
        }
      });

      if (existingMember) {
        throw new ConflictException('This user is already a member of the group');
      }
    }

    // Create expiration date (7 days from now)
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const invitation = await this.prisma.familyInvitations.create({
      data: {
        groupId: BigInt(groupId),
        inviterId: userId,
        inviteeEmail: createInvitationDto.inviteeEmail,
        status: InvitationStatus.PENDING,
        created_at: new Date(),
        expires_at
      },
      include: {
        group: true,
        inviter: true
      }
    });

    return FamilyInvitation.fromPrisma(invitation);
  }

  async findAll(groupId: string): Promise<FamilyInvitation[]> {
    const invitations = await this.prisma.familyInvitations.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        group: true,
        inviter: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyInvitation.fromPrismaArray(invitations);
  }

  async findOne(id: string): Promise<FamilyInvitation | null> {
    const invitation = await this.prisma.familyInvitations.findUnique({
      where: { id: BigInt(id) },
      include: {
        group: true,
        inviter: true
      }
    });

    if (!invitation) {
      return null;
    }

    return FamilyInvitation.fromPrisma(invitation);
  }

  async findByEmail(email: string): Promise<FamilyInvitation[]> {
    const invitations = await this.prisma.familyInvitations.findMany({
      where: { inviteeEmail: email },
      include: {
        group: true,
        inviter: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyInvitation.fromPrismaArray(invitations);
  }

  async acceptInvitation(id: string, userId: string): Promise<void> {
    return this.prisma.$transaction(async (prisma) => {
      // Find the invitation
      const invitation = await prisma.familyInvitations.findUnique({
        where: { id: BigInt(id) },
        include: { group: true }
      });

      if (!invitation) {
        throw new NotFoundException(`Invitation with ID ${id} not found`);
      }

      // Check that the invitation is pending and not expired
      if (invitation.status !== InvitationStatus.PENDING) {
        throw new BadRequestException('This invitation is no longer valid');
      }

      const now = new Date();
      if (invitation.expires_at < now) {
        // Mark as expired and throw error
        await prisma.familyInvitations.update({
          where: { id: BigInt(id) },
          data: { status: InvitationStatus.EXPIRED }
        });
        throw new BadRequestException('This invitation has expired');
      }

      // Get the user
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Verify the user's email matches the invitation
      if (user.email.toLowerCase() !== invitation.inviteeEmail.toLowerCase()) {
        throw new BadRequestException('This invitation is not for your email address');
      }

      // Check if the user is already a member of the group
      const existingMember = await prisma.familyMembers.findFirst({
        where: {
          userId,
          groupId: invitation.groupId
        }
      });

      if (existingMember) {
        await prisma.familyInvitations.update({
          where: { id: BigInt(id) },
          data: { status: InvitationStatus.ACCEPTED }
        });
        throw new ConflictException('You are already a member of this group');
      }

      // Update invitation status
      await prisma.familyInvitations.update({
        where: { id: BigInt(id) },
        data: { status: InvitationStatus.ACCEPTED }
      });

      // Add user to the group as a member
      await prisma.familyMembers.create({
        data: {
          groupId: invitation.groupId,
          userId,
          role: FamilyMemberRole.MEMBER,
          joined_at: new Date()
        }
      });
    });
  }

  async rejectInvitation(id: string): Promise<void> {
    const invitation = await this.prisma.familyInvitations.findUnique({
      where: { id: BigInt(id) }
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    await this.prisma.familyInvitations.update({
      where: { id: BigInt(id) },
      data: { status: InvitationStatus.REJECTED }
    });
  }

  async cancelInvitation(id: string, userId: string): Promise<void> {
    const invitation = await this.prisma.familyInvitations.findUnique({
      where: { id: BigInt(id) }
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    // Only the inviter or a group admin/owner can cancel
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: invitation.groupId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (invitation.inviterId !== userId && !member) {
      throw new BadRequestException('You do not have permission to cancel this invitation');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    await this.prisma.familyInvitations.delete({
      where: { id: BigInt(id) }
    });
  }

  async markAsExpired(id: string): Promise<void> {
    await this.prisma.familyInvitations.update({
      where: { id: BigInt(id) },
      data: { status: InvitationStatus.EXPIRED }
    });
  }

  async cleanupExpiredInvitations(): Promise<number> {
    const now = new Date();
    
    const result = await this.prisma.familyInvitations.updateMany({
      where: {
        status: InvitationStatus.PENDING,
        expires_at: { lt: now }
      },
      data: { 
        status: InvitationStatus.EXPIRED 
      }
    });

    return result.count;
  }

  async findPendingInvitationByEmailAndGroup(email: string, groupId: string): Promise<FamilyInvitation | null> {
    const invitation = await this.prisma.familyInvitations.findFirst({
      where: {
        inviteeEmail: email,
        groupId: BigInt(groupId),
        status: InvitationStatus.PENDING,
        expires_at: { gt: new Date() }
      },
      include: {
        group: true,
        inviter: true
      }
    });

    if (!invitation) {
      return null;
    }

    return FamilyInvitation.fromPrisma(invitation);
  }
}
