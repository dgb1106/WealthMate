import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { BudgetRepository } from './budget-repository.interface';
import { DateUtilsService } from '../../common/services/date-utils.service';

@Injectable()
export class PrismaBudgetRepository implements BudgetRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dateUtils: DateUtilsService
  ) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto): Promise<Budget> {
    try {
      // Check if category exists
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(createBudgetDto.categoryId) },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${createBudgetDto.categoryId} not found`);
      }

      // Parse dates
      const startDate = new Date(createBudgetDto.start_date);
      const endDate = new Date(createBudgetDto.end_date);
      
      // Validate date range using Budget entity
      const tempBudget = new Budget({
        start_date: startDate,
        end_date: endDate,
        limit_amount: 0,
        spent_amount: 0
      });
      
      if (!tempBudget.hasValidDateRange()) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Calculate spent amount from existing transactions
      const existingTransactions = await this.prisma.transactions.aggregate({
        where: {
          userId,
          categoryId: BigInt(createBudgetDto.categoryId),
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      });

      const initialSpentAmount = Number(existingTransactions._sum.amount || 0);

      // Create budget in database
      const prismaBudget = await this.prisma.budgets.create({
        data: {
          userId,
          categoryId: BigInt(createBudgetDto.categoryId),
          limit_amount: createBudgetDto.limit_amount,
          spent_amount: Math.abs(initialSpentAmount),
          start_date: startDate,
          end_date: endDate,
        },
        include: {
          category: true
        }
      });

      // Convert to domain entity
      return Budget.fromPrisma(prismaBudget);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Could not create budget: ' + error.message);
    }
  }

  async findAll(userId: string): Promise<Budget[]> {
    const prismaBudgets = await this.prisma.budgets.findMany({
      where: { userId },
      include: {
        category: true
      }
    });
  
    return Budget.fromPrismaArray(prismaBudgets);
  }

  async findOne(id: string, userId: string): Promise<Budget> {
    const prismaBudget = await this.prisma.budgets.findFirst({
      where: {
        id: BigInt(id),
        userId
      },
      include: {
        category: true
      }
    });

    if (!prismaBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return Budget.fromPrisma(prismaBudget);
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    // Check if budget exists
    const existingBudget = await this.findOne(id, userId);

    const updateData: any = {};

    // Prepare update data
    if (updateBudgetDto.categoryId) {
      // Check if category exists
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(updateBudgetDto.categoryId) }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateBudgetDto.categoryId} not found`);
      }
      
      updateData.categoryId = BigInt(updateBudgetDto.categoryId);
    }
    
    // Update numeric values if provided
    if (updateBudgetDto.limit_amount !== undefined) {
      updateData.limit_amount = updateBudgetDto.limit_amount;
    }
    
    if (updateBudgetDto.spent_amount !== undefined) {
      updateData.spent_amount = updateBudgetDto.spent_amount;
    }
    
    // Handle date updates with validation
    let startDate = existingBudget.start_date;
    let endDate = existingBudget.end_date;
    
    if (updateBudgetDto.start_date) {
      startDate = new Date(updateBudgetDto.start_date);
      updateData.start_date = startDate;
    }
    
    if (updateBudgetDto.end_date) {
      endDate = new Date(updateBudgetDto.end_date);
      updateData.end_date = endDate;
    }
    
    // Validate dates using Budget entity
    const tempBudget = new Budget({
      start_date: startDate,
      end_date: endDate,
      limit_amount: 0,
      spent_amount: 0
    });
    
    if (!tempBudget.hasValidDateRange()) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Update budget
    const updatedPrismaBudget = await this.prisma.budgets.update({
      where: {
        id: BigInt(id)
      },
      data: updateData,
      include: {
        category: true
      }
    });

    return Budget.fromPrisma(updatedPrismaBudget);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify budget exists and belongs to user
    await this.findOne(id, userId);

    // Delete budget
    await this.prisma.budgets.delete({
      where: {
        id: BigInt(id)
      }
    });
  }

  async findByCategory(userId: string, categoryId: string): Promise<Budget[]> {
    const prismaBudgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        categoryId: BigInt(categoryId)
      },
      include: {
        category: true
      }
    });

    return Budget.fromPrismaArray(prismaBudgets);
  }

  async getCurrentBudgets(userId: string): Promise<Budget[]> {
    const today = new Date();
    
    const prismaBudgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        start_date: { lte: today },
        end_date: { gte: today }
      },
      include: {
        category: true
      }
    });

    return Budget.fromPrismaArray(prismaBudgets);
  }

  async updateSpentAmount(id: string, userId: string, amount: number): Promise<Budget> {
    // Verify budget exists and belongs to user
    await this.findOne(id, userId);

    // Update spent amount
    const updatedPrismaBudget = await this.prisma.budgets.update({
      where: {
        id: BigInt(id)
      },
      data: {
        spent_amount: amount
      },
      include: {
        category: true
      }
    });

    return Budget.fromPrisma(updatedPrismaBudget);
  }

  async incrementSpentAmount(id: string, userId: string, amount: number): Promise<Budget> {
    // Verify budget exists and belongs to user
    await this.findOne(id, userId);

    // Increment spent amount
    const updatedPrismaBudget = await this.prisma.budgets.update({
      where: {
        id: BigInt(id)
      },
      data: {
        spent_amount: {
          increment: amount
        }
      },
      include: {
        category: true
      }
    });

    return Budget.fromPrisma(updatedPrismaBudget);
  }

  async getCurrentMonthBudgets(userId: string): Promise<Budget[]> {
    const { firstDay, lastDay } = this.dateUtils.getCurrentMonthRange();
    
    const prismaBudgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        OR: [
          // Budgets starting this month
          { start_date: { gte: firstDay, lte: lastDay } },
          // Budgets ending this month
          { end_date: { gte: firstDay, lte: lastDay } },
          // Budgets spanning this month
          {
            AND: [
              { start_date: { lte: firstDay } },
              { end_date: { gte: lastDay } }
            ]
          }
        ]
      },
      include: {
        category: true
      }
    });
    
    return Budget.fromPrismaArray(prismaBudgets);
  }

  async findMatchingBudgets(userId: string, categoryId: string, date: Date): Promise<Budget[]> {
    const prismaBudgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        categoryId: BigInt(categoryId),
        start_date: { lte: date },
        end_date: { gte: date },
      },
      include: {
        category: true
      }
    });
  
    return prismaBudgets.map(Budget.fromPrisma);
  }
}
