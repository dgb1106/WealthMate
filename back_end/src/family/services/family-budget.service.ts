import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyBudget } from '../entities/family-budget.entity';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';
import { UserDomainService } from '../../users/services/user-domain.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ContributionType } from '../../common/enums/enum';

@Injectable()
export class FamilyBudgetService {
  constructor(
    private readonly familyBudgetRepository: PrismaFamilyBudgetRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
    private readonly userDomainService: UserDomainService,
    private readonly prisma: PrismaService,
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

    // Check if a budget for this category already exists (enforcing one budget per category)
    const existingBudgets = await this.familyBudgetRepository.findByCategory(
      groupId, 
      createBudgetDto.categoryId
    );

    if (existingBudgets.length > 0) {
      throw new BadRequestException(
        'A budget for this category already exists. Only one budget per category is allowed.'
      );
    }

    // Calculate the initial spent amount from existing contributions
    const startDate = new Date(createBudgetDto.start_date);
    const endDate = new Date(createBudgetDto.end_date);
    const totalSpent = await this.calculateTotalSpent(
      groupId,
      createBudgetDto.categoryId,
      startDate,
      endDate
    );

    // Create a new DTO with the calculated spent amount
    const enrichedDto = {
      ...createBudgetDto,
      spent_amount: totalSpent
    };

    // Create the budget with the calculated spent amount
    return this.familyBudgetRepository.create(groupId, userId, enrichedDto);
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

    // If the category is being changed, verify no other budget exists for the new category
    if (updateBudgetDto.categoryId && updateBudgetDto.categoryId !== budget.categoryId) {
      const existingBudgets = await this.familyBudgetRepository.findByCategory(
        budget.groupId, 
        updateBudgetDto.categoryId
      );

      if (existingBudgets.length > 0) {
        throw new BadRequestException(
          'A budget for this category already exists. Only one budget per category is allowed.'
        );
      }
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

  /**
   * Calculates the total amount spent from existing contributions for a category and group
   * within a specific date range
   */
  private async calculateTotalSpent(
    groupId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Lấy danh sách transaction IDs thỏa mãn điều kiện
    const transactions = await this.prisma.transactions.findMany({
      where: {
        categoryId: BigInt(categoryId),
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        amount: true
      }
    });
  
    // Lấy các contributions thuộc những transactions này
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: {
        groupId: BigInt(groupId),
        contributionType: ContributionType.BUDGET,
        transactionId: {
          in: transactions.map(t => t.id)
        }
      },
      select: {
        transactionId: true
      }
    });
  
    // Lấy tập hợp transaction IDs từ contributions
    const contributionTransactionIds = new Set(
      contributions.map(c => c.transactionId.toString())
    );
  
    // Tính tổng amount từ transactions mà có trong contributions
    const totalSpent = transactions.reduce((sum, transaction) => {
      // Chỉ cộng amount của transaction có trong contributions
      if (contributionTransactionIds.has(transaction.id.toString())) {
        return sum + Number(transaction.amount);
      }
      return sum;
    }, 0);
  
    return Math.abs(totalSpent); // Đảm bảo số dương vì chi tiêu thường là số âm
  }
}
