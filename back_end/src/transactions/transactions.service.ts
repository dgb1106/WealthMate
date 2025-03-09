import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TransactionType } from '../common/enums/enum';
import { Decimal } from '@prisma/client/runtime/library';

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
  private validateAmount(amount: number | Decimal) {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount);
    if (isNaN(numericAmount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
  }

  // Updated create method with more robust error handling
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    this.validateAmount(createTransactionDto.amount);
    
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find the category
        const category = await prisma.categories.findUnique({
          where: { id: BigInt(createTransactionDto.categoryId) },
        });

        if (!category) {
          throw new NotFoundException(`Category with ID ${createTransactionDto.categoryId} not found`);
        }

        // Apply the correct sign based on category type
        let balanceAdjustment = createTransactionDto.amount;
        if (category.type === TransactionType.EXPENSE) {
          // Ensure expenses are always negative
          balanceAdjustment = -Math.abs(createTransactionDto.amount);
        } else if (category.type === TransactionType.INCOME) {
          // Ensure income is always positive
          balanceAdjustment = Math.abs(createTransactionDto.amount);
        }

        // Determine the final transaction amount based on category type
        const transactionAmount = category.type === TransactionType.EXPENSE 
          ? -Math.abs(createTransactionDto.amount) 
          : Math.abs(createTransactionDto.amount);

        // Create transaction and update user balance in the same transaction
        const [transactionData, updatedUser] = await Promise.all([
          prisma.transactions.create({
            data: {
              userId,
              categoryId: BigInt(createTransactionDto.categoryId),
              amount: transactionAmount, // Store with the correct sign
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
                increment: balanceAdjustment,
              },
              updated_at: new Date(),
            },
            select: {
              current_balance: true
            }
          })
        ]);

        // Clear cache for user's transactions
        await this.cacheManager.del(`transactions:${userId}`);

        return {
          ...transactionData,
          id: String(transactionData.id),
          categoryId: String(transactionData.categoryId),
          newBalance: updatedUser.current_balance
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to create transaction: ${error.message}`);
      }
    });
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find original transaction
        const originalTransaction = await prisma.transactions.findFirst({
          where: { 
            id: BigInt(id),
            userId 
          },
          include: {
            category: true
          }
        });
  
        if (!originalTransaction) {
          throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
  
        // Find the category (original or new if category is changing)
        const categoryId = updateTransactionDto.categoryId 
          ? BigInt(updateTransactionDto.categoryId)
          : originalTransaction.categoryId;
          
        const category = await prisma.categories.findUnique({
          where: { id: categoryId }
        });
  
        if (!category) {
          throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }
  
        // Calculate amount change
        let newAmount = updateTransactionDto.amount ?? originalTransaction.amount;
        this.validateAmount(newAmount);
  
        // Adjust the new amount based on category type
        if (category.type === TransactionType.EXPENSE) {
          newAmount = typeof newAmount === 'number' ? -Math.abs(newAmount) : new Decimal(-Math.abs(Number(newAmount)));
        } else {
          newAmount = typeof newAmount === 'number' ? Math.abs(newAmount) : new Decimal(Math.abs(Number(newAmount)));
        }
  
        // Calculate the balance adjustment
        const balanceAdjustment = Number(newAmount) - Number(originalTransaction.amount);
  
        // Update transaction and user balance in a single transaction
        const [updatedTransaction, updatedUser] = await Promise.all([
          prisma.transactions.update({
            where: { id: BigInt(id) },
            data: {
              categoryId: updateTransactionDto.categoryId ? BigInt(updateTransactionDto.categoryId) : undefined,
              amount: newAmount,
              description: updateTransactionDto.description,
            },
            include: {
              category: true
            }
          }),
          prisma.users.update({
            where: { id: userId },
            data: {
              current_balance: {
                increment: balanceAdjustment
              },
              updated_at: new Date()
            },
            select: {
              current_balance: true
            }
          })
        ]);
  
        // Clear cache for user's transactions
        await this.cacheManager.del(`transactions:${userId}`);
  
        return {
          ...updatedTransaction,
          id: String(updatedTransaction.id),
          categoryId: String(updatedTransaction.categoryId),
          newBalance: updatedUser.current_balance
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to update transaction: ${error.message}`);
      }
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        // Find transaction to delete
        const transaction = await prisma.transactions.findFirst({
          where: {
            id: BigInt(id),
            userId
          }
        });
  
        if (!transaction) {
          throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
  
        // Calculate balance adjustment (reverse of the transaction amount)
        const balanceAdjustment = -transaction.amount;
  
        // Delete transaction and update user balance
        const [_, updatedUser] = await Promise.all([
          prisma.transactions.delete({
            where: { id: BigInt(id) }
          }),
          prisma.users.update({
            where: { id: userId },
            data: {
              current_balance: {
                increment: balanceAdjustment
              },
              updated_at: new Date()
            },
            select: {
              current_balance: true
            }
          })
        ]);
  
        // Clear cache for user's transactions
        await this.cacheManager.del(`transactions:${userId}`);
  
        return {
          message: `Transaction with ID ${id} successfully deleted`,
          newBalance: updatedUser.current_balance
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Failed to delete transaction: ${error.message}`);
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
