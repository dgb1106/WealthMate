import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TransactionsService {
  private readonly cacheManager: Cache;
  
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    this.cacheManager = cacheManager;
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private validateAmount(amount: number) {
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    this.validateAmount(createTransactionDto.amount);
    
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Kiểm tra category
        const category = await prisma.categories.findUnique({
          where: { id: BigInt(createTransactionDto.categoryId) },
        });

        if (!category) {
          throw new NotFoundException(`Category with ID ${createTransactionDto.categoryId} not found`);
        }

        // Tạo transaction và cập nhật balance trong cùng một transaction
        const [transactionData, _] = await Promise.all([
          prisma.transactions.create({
            data: {
              userId,
              categoryId: BigInt(createTransactionDto.categoryId),
              amount: createTransactionDto.amount,
              description: createTransactionDto.description,
              created_at: new Date(),
            },
            include: {
              category: true
            }
          }),
          prisma.users.update({
            where: { id: userId },
            data: {
              current_balance: {
                increment: createTransactionDto.amount,
              },
              updated_at: new Date(),
            },
          })
        ]);

        return {
          ...transactionData,
          id: String(transactionData.id),
          categoryId: String(transactionData.categoryId)
        };
      } catch (error) {
        throw new InternalServerErrorException('Failed to create transaction');
      }
    });
  }

  private async findTransactions(where: any, orderBy: any = { created_at: 'desc' }) {
    return this.prisma.transactions.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    });
  }

  async findAllByUser(userId: string) {
    const cacheKey = `transactions:${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const transactions = await this.findTransactions({ userId });
    await this.cacheManager.set(cacheKey, transactions, 60 * 5); // Cache trong 5 phút
    
    return transactions;
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findAllByUserForCurrentMonth(userId: string) {
    const { firstDay, lastDay } = this.getCurrentMonthRange();
    return this.findTransactions({ 
      userId,
      created_at: {
        gte: firstDay,
        lte: lastDay
      }
    });
  }

  private getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { firstDay, lastDay };
  }

  // Get transactions for a specific month/year
  async findAllByUserForMonth(userId: string, month: number, year: number) {
    // Month is 0-indexed (0 = January, 11 = December)
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return this.prisma.transactions.findMany({
      where: { 
        userId,
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findAllByUserForDateRange(userId: string, startDate: Date, endDate: Date) {
    this.validateDateRange(startDate, endDate);
    return this.prisma.transactions.findMany({
      where: { 
        userId,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get all income transactions (amount > 0) for a user
  async findAllIncomeByUser(userId: string) {
    return this.prisma.transactions.findMany({
      where: { 
        userId,
        amount: {
          gt: 0
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get all expense transactions (amount < 0)
  async findAllExpensesByUser(userId: string) {
    return this.prisma.transactions.findMany({
      where: { 
        userId,
        amount: {
          lt: 0
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get all transactions for a specific category
  async findAllByUserAndCategory(userId: string, categoryId: string) {
    return this.prisma.transactions.findMany({
      where: { 
        userId,
        categoryId: BigInt(categoryId)
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get summary of transactions by category for a date range
  async getSummaryByCategory(userId: string, startDate: Date, endDate: Date) {
    const [transactions, categories] = await Promise.all([
      this.prisma.transactions.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      }),
      this.prisma.categories.findMany() // Lấy tất cả categories một lần
    ]);

    const categoryMap = new Map(categories.map(c => [c.id.toString(), c]));
    
    return transactions.map((t) => ({
      category: categoryMap.get(t.categoryId.toString()),
      totalAmount: t._sum.amount
    }));
  }

}
