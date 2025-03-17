import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyGroupRepository } from '../repositories/prisma-family-group.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyGroup } from '../entities/family-group.entity';
import { CreateFamilyGroupDto } from '../dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '../dto/update-family-group.dto';

@Injectable()
export class FamilyGroupService {
  constructor(
    private readonly familyGroupRepository: PrismaFamilyGroupRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
  ) {}

  async create(userId: string, createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    return this.familyGroupRepository.create(userId, createFamilyGroupDto);
  }

  async findAll(userId: string): Promise<FamilyGroup[]> {
    // Only return groups the user is a member of
    return this.familyGroupRepository.findUserGroups(userId);
  }

  async findOne(id: string, userId: string): Promise<FamilyGroup> {
    const group = await this.familyGroupRepository.findOne(id);
    
    if (!group) {
      throw new NotFoundException(`Family group with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, id);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this group');
    }

    return group;
  }

  async update(
    id: string,
    userId: string,
    updateFamilyGroupDto: UpdateFamilyGroupDto,
  ): Promise<FamilyGroup> {
    const group = await this.familyGroupRepository.findOne(id);
    
    if (!group) {
      throw new NotFoundException(`Family group with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to update
    return this.familyGroupRepository.update(id, userId, updateFamilyGroupDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const group = await this.familyGroupRepository.findOne(id);
    
    if (!group) {
      throw new NotFoundException(`Family group with ID ${id} not found`);
    }

    // The repository method already checks if the user is the owner
    return this.familyGroupRepository.remove(id, userId);
  }

  async getGroupMembers(id: string, userId: string): Promise<any[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, id);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this group');
    }

    return this.familyGroupRepository.getGroupMembers(id);
  }

  async getGroupSummary(id: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, id);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this group');
    }

    return this.familyGroupRepository.getGroupSummary(id);
  }

  async searchGroups(searchTerm: string): Promise<FamilyGroup[]> {
    return this.familyGroupRepository.searchGroups(searchTerm);
  }
}
