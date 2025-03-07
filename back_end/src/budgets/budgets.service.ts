import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    try {
      // Kiểm tra category có tồn tại không
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(createBudgetDto.categoryId) },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${createBudgetDto.categoryId} not found`);
      }

      // Kiểm tra thời gian hợp lệ
      const startDate = new Date(createBudgetDto.start_date);
      const endDate = new Date(createBudgetDto.end_date);

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Tạo budget mới
      const budget = await this.prisma.budgets.create({
        data: {
          userId,
          categoryId: BigInt(createBudgetDto.categoryId),
          limit_amount: createBudgetDto.limit_amount,
          spent_amount: createBudgetDto.spent_amount || 0,
          start_date: startDate,
          end_date: endDate,
        },
        include: {
          category: true
        }
      });

      return {
        ...budget,
        id: String(budget.id),
        categoryId: String(budget.categoryId)
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Could not create budget: ' + error.message);
    }
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budgets.findMany({
      where: { userId },
      include: {
        category: true
      }
    });

    return budgets.map(budget => ({
      ...budget,
      id: String(budget.id),
      categoryId: String(budget.categoryId)
    }));
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budgets.findFirst({
      where: {
        id: BigInt(id),
        userId
      },
      include: {
        category: true
      }
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return {
      ...budget,
      id: String(budget.id),
      categoryId: String(budget.categoryId)
    };
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    // Kiểm tra budget tồn tại
    const existingBudget = await this.prisma.budgets.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!existingBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Kiểm tra category nếu được cung cấp
    if (updateBudgetDto.categoryId) {
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(updateBudgetDto.categoryId) }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateBudgetDto.categoryId} not found`);
      }
    }

    // Kiểm tra thời gian hợp lệ nếu cả hai trường thời gian được cung cấp
    if (updateBudgetDto.start_date && updateBudgetDto.end_date) {
      const startDate = new Date(updateBudgetDto.start_date);
      const endDate = new Date(updateBudgetDto.end_date);

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateBudgetDto.start_date) {
      const startDate = new Date(updateBudgetDto.start_date);
      const existingEndDate = existingBudget.end_date;

      if (startDate > existingEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateBudgetDto.end_date) {
      const endDate = new Date(updateBudgetDto.end_date);
      const existingStartDate = existingBudget.start_date;

      if (existingStartDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {};

    if (updateBudgetDto.categoryId) {
      updateData.categoryId = BigInt(updateBudgetDto.categoryId);
    }
    if (updateBudgetDto.limit_amount !== undefined) {
      updateData.limit_amount = updateBudgetDto.limit_amount;
    }
    if (updateBudgetDto.spent_amount !== undefined) {
      updateData.spent_amount = updateBudgetDto.spent_amount;
    }
    if (updateBudgetDto.start_date) {
      updateData.start_date = new Date(updateBudgetDto.start_date);
    }
    if (updateBudgetDto.end_date) {
      updateData.end_date = new Date(updateBudgetDto.end_date);
    }

    // Cập nhật budget
    const updatedBudget = await this.prisma.budgets.update({
      where: {
        id: BigInt(id)
      },
      data: updateData,
      include: {
        category: true
      }
    });

    return {
      ...updatedBudget,
      id: String(updatedBudget.id),
      categoryId: String(updatedBudget.categoryId)
    };
  }

  async remove(id: string, userId: string) {
    // Kiểm tra budget tồn tại
    const existingBudget = await this.prisma.budgets.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!existingBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Xóa budget
    await this.prisma.budgets.delete({
      where: {
        id: BigInt(id)
      }
    });

    return { success: true, message: 'Budget deleted successfully' };
  }

  async findByCategory(userId: string, categoryId: string) {
    const budgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        categoryId: BigInt(categoryId)
      },
      include: {
        category: true
      }
    });

    return budgets.map(budget => ({
      ...budget,
      id: String(budget.id),
      categoryId: String(budget.categoryId)
    }));
  }

  async getCurrentBudgets(userId: string) {
    const today = new Date();
    
    const budgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        start_date: {
          lte: today
        },
        end_date: {
          gte: today
        }
      },
      include: {
        category: true
      }
    });

    return budgets.map(budget => ({
      ...budget,
      id: String(budget.id),
      categoryId: String(budget.categoryId)
    }));
  }

  async updateSpentAmount(id: string, userId: string, amount: number) {
    const budget = await this.prisma.budgets.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const updatedBudget = await this.prisma.budgets.update({
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

    return {
      ...updatedBudget,
      id: String(updatedBudget.id),
      categoryId: String(updatedBudget.categoryId)
    };
  }

  async getCurrentMonthBudgets(userId: string) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const budgets = await this.prisma.budgets.findMany({
      where: {
        userId,
        OR: [
          {
            // Ngân sách bắt đầu trong tháng này
            start_date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          {
            // Ngân sách kết thúc trong tháng này
            end_date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          {
            // Ngân sách bao gồm cả tháng này
            AND: [
              {
                start_date: {
                  lte: firstDayOfMonth
                }
              },
              {
                end_date: {
                  gte: lastDayOfMonth
                }
              }
            ]
          }
        ]
      },
      include: {
        category: true
      }
    });

    return budgets.map(budget => ({
      ...budget,
      id: String(budget.id),
      categoryId: String(budget.categoryId)
    }));
  }
}
