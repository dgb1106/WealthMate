import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyGoalRepository } from '../repositories/prisma-family-goal.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyGoal } from '../entities/family-goal.entity';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';

@Injectable()
export class FamilyGoalService {
  constructor(
    private readonly familyGoalRepository: PrismaFamilyGoalRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
  ) {}

  async create(
    groupId: string,
    userId: string,
    createGoalDto: CreateFamilyGoalDto,
  ): Promise<FamilyGoal> {
    // Check if user is a member with appropriate permissions
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!member || !member.canManageBudgetsAndGoals()) {
      throw new BadRequestException('You do not have permission to create goals for this group');
    }
    
    return this.familyGoalRepository.create(groupId, userId, createGoalDto);
  }

  async findAll(groupId: string, userId: string): Promise<FamilyGoal[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goals for this group');
    }
    
    return this.familyGoalRepository.findAll(groupId);
  }

  async findOne(id: string, userId: string): Promise<FamilyGoal> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, goal.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this goal');
    }

    return goal;
  }

  async update(
    id: string,
    userId: string,
    updateGoalDto: UpdateFamilyGoalDto,
  ): Promise<FamilyGoal> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to update
    return this.familyGoalRepository.update(id, userId, updateGoalDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to delete
    return this.familyGoalRepository.remove(id, userId);
  }

  async findActiveByGroup(groupId: string, userId: string): Promise<FamilyGoal[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goals for this group');
    }
    
    return this.familyGoalRepository.findActiveByGroup(groupId);
  }

  async getGoalSummary(id: string, userId: string): Promise<any> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, goal.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this goal');
    }
    
    return this.familyGoalRepository.getGoalSummary(id);
  }

  async getGroupGoalsSummary(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goal summary for this group');
    }
    
    return this.familyGoalRepository.getGroupGoalsSummary(groupId);
  }
}
