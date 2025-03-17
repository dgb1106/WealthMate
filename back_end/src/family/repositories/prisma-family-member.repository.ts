import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyMemberRepository } from './family-member-repository.interface';
import { FamilyMember } from '../entities/family-member.entity';
import { FamilyMemberRole } from '../../common/enums/enum';

@Injectable()
export class PrismaFamilyMemberRepository implements FamilyMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(groupId: string): Promise<FamilyMember[]> {
    const members = await this.prisma.familyMembers.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        user: true,
        group: true
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
        { joined_at: 'asc' }
      ]
    });

    return FamilyMember.fromPrismaArray(members);
  }

  async findOne(id: string): Promise<FamilyMember | null> {
    const member = await this.prisma.familyMembers.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: true,
        group: true
      }
    });

    if (!member) {
      return null;
    }

    return FamilyMember.fromPrisma(member);
  }

  async findByUserAndGroup(userId: string, groupId: string): Promise<FamilyMember | null> {
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: BigInt(groupId)
      },
      include: {
        user: true,
        group: true
      }
    });

    if (!member) {
      return null;
    }

    return FamilyMember.fromPrisma(member);
  }

  async addMember(groupId: string, userId: string, role: FamilyMemberRole): Promise<FamilyMember> {
    // Check if user already exists in the group
    const existingMember = await this.prisma.familyMembers.findFirst({
      where: {
        groupId: BigInt(groupId),
        userId
      }
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this group');
    }

    // If adding an owner, check if there's already an owner
    if (role === FamilyMemberRole.OWNER) {
      const existingOwner = await this.prisma.familyMembers.findFirst({
        where: {
          groupId: BigInt(groupId),
          role: FamilyMemberRole.OWNER
        }
      });

      if (existingOwner) {
        throw new BadRequestException('This group already has an owner');
      }
    }

    const member = await this.prisma.familyMembers.create({
      data: {
        groupId: BigInt(groupId),
        userId,
        role,
        joined_at: new Date()
      },
      include: {
        user: true,
        group: true
      }
    });

    return FamilyMember.fromPrisma(member);
  }

  async updateRole(id: string, role: FamilyMemberRole): Promise<FamilyMember> {
    // Get the member to update
    const existingMember = await this.prisma.familyMembers.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingMember) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    // Check if trying to change the owner role
    if (existingMember.role === FamilyMemberRole.OWNER) {
      throw new BadRequestException('Cannot change the role of the group owner');
    }

    // Check if trying to assign owner role when there's already an owner
    if (role === FamilyMemberRole.OWNER) {
      const existingOwner = await this.prisma.familyMembers.findFirst({
        where: {
          groupId: existingMember.groupId,
          role: FamilyMemberRole.OWNER
        }
      });

      if (existingOwner) {
        throw new BadRequestException('This group already has an owner. Use transfer ownership instead.');
      }
    }

    const updatedMember = await this.prisma.familyMembers.update({
      where: { id: BigInt(id) },
      data: { role },
      include: {
        user: true,
        group: true
      }
    });

    return FamilyMember.fromPrisma(updatedMember);
  }

  async remove(id: string): Promise<void> {
    // Get the member to check if it's the owner
    const member = await this.prisma.familyMembers.findUnique({
      where: { id: BigInt(id) }
    });

    if (!member) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    if (member.role === FamilyMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove the owner of the group');
    }

    await this.prisma.familyMembers.delete({
      where: { id: BigInt(id) }
    });
  }

  async transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    return this.prisma.$transaction(async (prisma) => {
      // Ensure the current owner is the actual owner
      const currentOwner = await prisma.familyMembers.findFirst({
        where: {
          groupId: BigInt(groupId),
          userId: currentOwnerId,
          role: FamilyMemberRole.OWNER
        }
      });

      if (!currentOwner) {
        throw new BadRequestException('Only the current owner can transfer ownership');
      }

      // Ensure the new owner is a member of the group
      const newOwner = await prisma.familyMembers.findFirst({
        where: {
          groupId: BigInt(groupId),
          userId: newOwnerId
        }
      });

      if (!newOwner) {
        throw new NotFoundException(`User ${newOwnerId} is not a member of this group`);
      }

      // Update the current owner to be an admin
      await prisma.familyMembers.update({
        where: { id: currentOwner.id },
        data: { role: FamilyMemberRole.ADMIN }
      });

      // Update the new owner
      await prisma.familyMembers.update({
        where: { id: newOwner.id },
        data: { role: FamilyMemberRole.OWNER }
      });
    });
  }

  async isGroupMember(userId: string, groupId: string): Promise<boolean> {
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: BigInt(groupId)
      }
    });

    return !!member;
  }

  async countMembersByRole(groupId: string): Promise<{ role: string; count: number }[]> {
    const counts = await this.prisma.familyMembers.groupBy({
      by: ['role'],
      where: { groupId: BigInt(groupId) },
      _count: {
        role: true
      }
    });

    return counts.map(item => ({
      role: item.role,
      count: item._count.role
    }));
  }
}
