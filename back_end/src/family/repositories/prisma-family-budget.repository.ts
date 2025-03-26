import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyBudgetRepository } from './family-budget-repository.interface';
import { FamilyBudget } from '../entities/family-budget.entity';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';
import { FamilyMemberRole } from '../../common/enums/enum';

@Injectable()
export class PrismaFamilyBudgetRepository implements FamilyBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(groupId: string, userId: string, createBudgetDto: CreateFamilyBudgetDto): Promise<FamilyBudget> {
    // Check if the user is a member of the group with appropriate permissions
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
      throw new BadRequestException('You do not have permission to create budgets for this group');
    }

    // Verify the category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: BigInt(createBudgetDto.categoryId) }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createBudgetDto.categoryId} not found`);
    }

    // Check date validity
    const startDate = new Date(createBudgetDto.start_date);
    const endDate = new Date(createBudgetDto.end_date);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create the budget
    const budgetData = await this.prisma.familyBudgets.create({
      data: {
        groupId: BigInt(groupId),
        categoryId: BigInt(createBudgetDto.categoryId),
        limit_amount: createBudgetDto.limit_amount,
        spent_amount: createBudgetDto.spent_amount || 0,
        start_date: startDate,
        end_date: endDate,
        created_at: new Date(),
        created_by: userId
      },
      include: {
        category: true,
        creator: true,
        group: true
      }
    });

    return FamilyBudget.fromPrisma(budgetData);
  }

  async findAll(groupId: string): Promise<FamilyBudget[]> {
    const budgets = await this.prisma.familyBudgets.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        category: true,
        creator: true,
        group: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyBudget.fromPrismaArray(budgets);
  }

  async findOne(id: string): Promise<FamilyBudget | null> {
    const budget = await this.prisma.familyBudgets.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
        creator: true,
        group: true
      }
    });

    if (!budget) {
      return null;
    }

    return FamilyBudget.fromPrisma(budget);
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateFamilyBudgetDto): Promise<FamilyBudget> {
    // Get the budget to update
    const budget = await this.prisma.familyBudgets.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Check permissions: only group admin/owner or budget creator can update
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: budget.groupId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (budget.created_by !== userId && !member) {
      throw new BadRequestException('You do not have permission to update this budget');
    }

    // Prepare the update data
    const updateData: any = {};

    if (updateBudgetDto.categoryId) {
      // Verify the category exists
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(updateBudgetDto.categoryId) }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateBudgetDto.categoryId} not found`);
      }
      
      updateData.categoryId = BigInt(updateBudgetDto.categoryId);
    }

    if (updateBudgetDto.limit_amount !== undefined) {
      updateData.limit_amount = updateBudgetDto.limit_amount;
    }

    if (updateBudgetDto.spent_amount !== undefined) {
      updateData.spent_amount = updateBudgetDto.spent_amount;
    }

    let startDate = budget.start_date;
    let endDate = budget.end_date;

    if (updateBudgetDto.start_date) {
      startDate = new Date(updateBudgetDto.start_date);
      updateData.start_date = startDate;
    }

    if (updateBudgetDto.end_date) {
      endDate = new Date(updateBudgetDto.end_date);
      updateData.end_date = endDate;
    }

    // Validate dates
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Update the budget
    const updatedBudget = await this.prisma.familyBudgets.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        category: true,
        creator: true,
        group: true
      }
    });

    return FamilyBudget.fromPrisma(updatedBudget);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Get the budget to delete
    const budget = await this.prisma.familyBudgets.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Check permissions: only group admin/owner or budget creator can delete
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: budget.groupId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (budget.created_by !== userId && !member) {
      throw new BadRequestException('You do not have permission to delete this budget');
    }

    // Delete the budget
    await this.prisma.familyBudgets.delete({
      where: { id: BigInt(id) }
    });
  }

  async findActiveByGroup(groupId: string): Promise<FamilyBudget[]> {
    const today = new Date();
    
    const budgets = await this.prisma.familyBudgets.findMany({
      where: {
        groupId: BigInt(groupId),
        start_date: { lte: today },
        end_date: { gte: today }
      },
      include: {
        category: true,
        creator: true
      },
      orderBy: { end_date: 'asc' }
    });

    return FamilyBudget.fromPrismaArray(budgets);
  }

  async findByCategory(groupId: string, categoryId: string): Promise<FamilyBudget[]> {
    const budgets = await this.prisma.familyBudgets.findMany({
      where: {
        groupId: BigInt(groupId),
        categoryId: BigInt(categoryId)
      },
      include: {
        category: true,
        creator: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyBudget.fromPrismaArray(budgets);
  }

  async findActiveByCategory(groupId: string, categoryId: string): Promise<FamilyBudget[]> {
    const today = new Date();
    
    const budgets = await this.prisma.familyBudgets.findMany({
      where: {
        groupId: BigInt(groupId),
        categoryId: BigInt(categoryId),
        start_date: { lte: today },
        end_date: { gte: today }
      },
      include: {
        category: true,
        creator: true
      },
      orderBy: { end_date: 'asc' }
    });

    return FamilyBudget.fromPrismaArray(budgets);
  }

  async incrementSpentAmount(id: string, amount: number): Promise<FamilyBudget> {
    const budget = await this.prisma.familyBudgets.findUnique({
      where: { id: BigInt(id) }
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Calculate new spent amount
    const newSpentAmount = Number(budget.spent_amount) + amount;

    const updatedBudget = await this.prisma.familyBudgets.update({
      where: { id: BigInt(id) },
      data: { spent_amount: newSpentAmount },
      include: {
        category: true,
        creator: true,
        group: true
      }
    });

    return FamilyBudget.fromPrisma(updatedBudget);
  }

  async getGroupBudgetSummary(groupId: string): Promise<any> {
    const group = await this.prisma.familyGroups.findUnique({
      where: { id: BigInt(groupId) }
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Get all active budgets
    const today = new Date();
    const activeBudgets = await this.prisma.familyBudgets.findMany({
      where: {
        groupId: BigInt(groupId),
        start_date: { lte: today },
        end_date: { gte: today }
      },
      include: {
        category: true
      }
    });

    // Get spending by category
    const spendingByCategory = activeBudgets.map(budget => ({
      categoryId: String(budget.categoryId),
      categoryName: budget.category.name,
      limit: Number(budget.limit_amount),
      spent: Number(budget.spent_amount),
      percentage: Number(budget.limit_amount) > 0 
        ? Math.round((Number(budget.spent_amount) / Number(budget.limit_amount)) * 100 * 10) / 10
        : 0
    }));

    // Calculate total spending and total limit
    const totalSpent = spendingByCategory.reduce((sum, item) => sum + item.spent, 0);
    const totalLimit = spendingByCategory.reduce((sum, item) => sum + item.limit, 0);

    return {
      groupId: String(group.id),
      groupName: group.name,
      totalBudgets: activeBudgets.length,
      totalSpent,
      totalLimit,
      overallPercentage: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100 * 10) / 10 : 0,
      spendingByCategory
    };
  }
}
