import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyMember } from '../entities/family-member.entity';
import { FamilyMemberRole } from '../../common/enums/enum';
import { UpdateFamilyMemberRoleDto } from '../dto/update-family-member-role.dto';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';

@Injectable()
export class FamilyMemberService {
  constructor(
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
  ) {}

  async findAll(groupId: string, userId: string): Promise<FamilyMember[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view members of this group');
    }
    
    return this.familyMemberRepository.findAll(groupId);
  }

  async findOne(id: string, userId: string): Promise<FamilyMember> {
    const member = await this.familyMemberRepository.findOne(id);
    
    if (!member) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, member.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this member');
    }

    return member;
  }

  async addMember(groupId: string, newUserId: string, userId: string): Promise<FamilyMember> {
    // Check if the requester has permission to add members
    const requesterMember = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!requesterMember || !requesterMember.isAdmin()) {
      throw new BadRequestException('You do not have permission to add members to this group');
    }

    return this.familyMemberRepository.addMember(groupId, newUserId, FamilyMemberRole.MEMBER);
  }

  async updateRole(id: string, updateRoleDto: UpdateFamilyMemberRoleDto, userId: string): Promise<FamilyMember> {
    const member = await this.familyMemberRepository.findOne(id);
    
    if (!member) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    // Check if the requester has permission to update roles
    const requesterMember = await this.familyMemberRepository.findByUserAndGroup(userId, member.groupId);
    
    if (!requesterMember || !requesterMember.isAdmin()) {
      throw new BadRequestException('You do not have permission to update member roles');
    }

    // Cannot promote to OWNER using this method
    if (updateRoleDto.role === FamilyMemberRole.OWNER) {
      throw new BadRequestException('Cannot promote to owner using this method. Use transfer ownership instead.');
    }

    return this.familyMemberRepository.updateRole(id, updateRoleDto.role);
  }

  async remove(id: string, userId: string): Promise<void> {
    const member = await this.familyMemberRepository.findOne(id);
    
    if (!member) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    // Check if the requester has permission to remove members
    const requesterMember = await this.familyMemberRepository.findByUserAndGroup(userId, member.groupId);
    
    if (!requesterMember || !requesterMember.isAdmin()) {
      throw new BadRequestException('You do not have permission to remove members from this group');
    }

    // Cannot remove self or owner
    if (member.userId === userId) {
      throw new BadRequestException('Cannot remove yourself from the group');
    }

    if (member.isOwner()) {
      throw new BadRequestException('Cannot remove the owner from the group');
    }

    return this.familyMemberRepository.remove(id);
  }

  async transferOwnership(groupId: string, transferDto: TransferOwnershipDto, userId: string): Promise<void> {
    // Check if the requester is the current owner
    const requesterMember = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!requesterMember || !requesterMember.isOwner()) {
      throw new BadRequestException('Only the group owner can transfer ownership');
    }

    return this.familyMemberRepository.transferOwnership(groupId, userId, transferDto.newOwnerId);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!member) {
      throw new BadRequestException('You are not a member of this group');
    }

    if (member.isOwner()) {
      throw new BadRequestException('The group owner cannot leave. Transfer ownership first.');
    }

    return this.familyMemberRepository.remove(member.id);
  }
}
