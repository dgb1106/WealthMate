import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { ContributionType } from '../../common/enums/enum';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FamilyTransactionContributionService {
  constructor(
    private readonly familyTransactionContributionRepository: PrismaFamilyTransactionContributionRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
    private readonly familyBudgetRepository: PrismaFamilyBudgetRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    createContributionDto: CreateFamilyTransactionContributionDto,
  ): Promise<FamilyTransactionContribution> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(
      userId, 
      createContributionDto.groupId
    );
    
    if (!isMember) {
      throw new BadRequestException('You do not have permission to add contributions to this group');
    }
    
    // Find and set the target ID based on contribution type
    const targetId = await this.findTargetId(createContributionDto);
    
    // Create a modified DTO with the target ID included
    // Also ensure userId is passed, using the authenticated user's ID if not provided
    const enrichedDto = {
      ...createContributionDto,
      targetId,
      userId: userId
    };
    
    // Create the contribution with the target ID
    const contribution = await this.familyTransactionContributionRepository.create(
      userId, 
      enrichedDto
    );


    try {
        await this.updateFamilyBudgets(
          contribution.groupId, 
          createContributionDto.categoryId,
          Math.abs(contribution.amount),
          new Date(),
        );
    } catch (error) {
        console.error('Failed to update family budget:', error);
        // We don't throw here as we don't want to fail the entire operation just because budget update failed
      }

    return contribution;
  }

  /**
   * Finds the appropriate target ID for a contribution based on type
   */
  private async findTargetId(createContributionDto: CreateFamilyTransactionContributionDto): Promise<string> {
    if (createContributionDto.contributionType === ContributionType.BUDGET) {
      // Find active budget for this category and group
      const today = new Date();
      const activeBudget = await this.prisma.familyBudgets.findFirst({
        where: {
          groupId: BigInt(createContributionDto.groupId),
          categoryId: BigInt(createContributionDto.categoryId),
          start_date: { lte: today },
          end_date: { gte: today }
        },
        orderBy: {
          end_date: 'asc' // Get the soonest ending budget if there are multiple
        }
      });

      if (!activeBudget) {
        throw new NotFoundException(`No active budget found for category ${createContributionDto.categoryId} in group ${createContributionDto.groupId}`);
      }

      return String(activeBudget.id);
    }
    else if (createContributionDto.contributionType === ContributionType.GOAL) {
      // Find an active goal in the group
      const activeGoal = await this.prisma.familyGoals.findFirst({
        where: {
          groupId: BigInt(createContributionDto.groupId),
          status: {
            not: 'COMPLETED'
          }
        },
        orderBy: {
          due_date: 'asc' // Get the soonest due goal if there are multiple
        }
      });

      if (!activeGoal) {
        throw new NotFoundException(`No active goal found in group ${createContributionDto.groupId}`);
      }

      return String(activeGoal.id);
    }
    
    throw new BadRequestException('Invalid contribution type');
  }

  /**
   * Updates family budgets when a new contribution is made
   */
  private async updateFamilyBudgets(
    groupId: string, 
    categoryId: string, 
    amount: number,
    transactionDate: Date
  ): Promise<void> {
    // Find active budgets for this category and group
    const activeBudgets = await this.familyBudgetRepository.findActiveByCategory(groupId, categoryId);
    console.log(activeBudgets);
    
    // Update spent amount for each matching active budget
    for (const budget of activeBudgets) {
      // Only update if the transaction date falls within the budget period
      if (new Date(transactionDate) >= budget.start_date && new Date(transactionDate) <= budget.end_date) {
        await this.familyBudgetRepository.incrementSpentAmount(budget.id, amount);
      }
    }
  }

  async findAll(groupId: string, paginationDto?: PaginationDto): Promise<{ 
    data: FamilyTransactionContribution[], 
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const { data, total } = await this.familyTransactionContributionRepository.findAll(
      groupId, 
      {
        page: paginationDto?.page,
        limit: paginationDto?.limit,
        includeDetails: paginationDto?.includeDetails
      }
    );
    
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByTransaction(transactionId: string, userId: string): Promise<FamilyTransactionContribution[]> {
    return this.familyTransactionContributionRepository.findByTransaction(transactionId, userId);
  }

  async findByUser(userId: string, groupId: string): Promise<FamilyTransactionContribution[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view contributions for this group');
    }
    
    return this.familyTransactionContributionRepository.findByUser(userId, groupId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const contribution = await this.familyTransactionContributionRepository.findOne(id);
    
    if (!contribution) {
      throw new NotFoundException(`Contribution with ID ${id} not found`);
    }

    // Check if user is a member of this group with admin rights or the creator of the contribution
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, contribution.groupId);
    
    if (!member || (!member.isAdmin() && contribution.transaction?.userId !== userId)) {
      throw new BadRequestException('You do not have permission to delete this contribution');
    }
    
    return this.familyTransactionContributionRepository.remove(id);
  }

  async getGroupContributionStats(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view stats for this group');
    }
    
    return this.familyTransactionContributionRepository.getGroupContributionStats(groupId);
  }
}
