import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyBudget } from '../entities/family-budget.entity';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';
import { UserDomainService } from '../../users/services/user-domain.service';

@Injectable()
export class FamilyBudgetService {
  constructor(
    private readonly familyBudgetRepository: PrismaFamilyBudgetRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async create(
    groupId: string,
    userId: string,
    createBudgetDto: CreateFamilyBudgetDto,
  ): Promise<FamilyBudget> {
    // Check if user is a member with appropriate permissions
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!member || !member.canManageBudgetsAndGoals()) {
      throw new BadRequestException('You do not have permission to create budgets for this group');
    }
    
    return this.familyBudgetRepository.create(groupId, userId, createBudgetDto);
  }

  async findAll(groupId: string, userId: string): Promise<FamilyBudget[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view budgets for this group');
    }
    
    return this.familyBudgetRepository.findAll(groupId);
  }

  async findOne(id: string, userId: string): Promise<FamilyBudget> {
    const budget = await this.familyBudgetRepository.findOne(id);
    
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, budget.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this budget');
    }

    return budget;
  }

  async update(
    id: string,
    userId: string,
    updateBudgetDto: UpdateFamilyBudgetDto,
  ): Promise<FamilyBudget> {
    const budget = await this.familyBudgetRepository.findOne(id);
    
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to update
    return this.familyBudgetRepository.update(id, userId, updateBudgetDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const budget = await this.familyBudgetRepository.findOne(id);
    
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to delete
    return this.familyBudgetRepository.remove(id, userId);
  }

  async findActiveByGroup(groupId: string, userId: string): Promise<FamilyBudget[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view budgets for this group');
    }
    
    return this.familyBudgetRepository.findActiveByGroup(groupId);
  }

  async findByCategory(groupId: string, categoryId: string, userId: string): Promise<FamilyBudget[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view budgets for this group');
    }
    
    return this.familyBudgetRepository.findByCategory(groupId, categoryId);
  }

  async getGroupBudgetSummary(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view budget summary for this group');
    }
    
    const summary = await this.familyBudgetRepository.getGroupBudgetSummary(groupId);
    
    // Add budget health status
    const activeBudgets = await this.familyBudgetRepository.findActiveByGroup(groupId);
    summary.budgetHealth = this.userDomainService.calculateBudgetHealth(activeBudgets);
    
    return summary;
  }
}
