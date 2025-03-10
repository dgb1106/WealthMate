import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionRepository } from './transaction-repository.interface';
import { Transaction } from '../entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, categoryId: string, amount: number | Decimal, description: string): Promise<Transaction> {
    const transaction = await this.prisma.transactions.create({
      data: {
        userId,
        categoryId: BigInt(categoryId),
        amount,
        description,
        created_at: new Date(),
      },
      include: {
        category: true
      }
    });

    return Transaction.fromPrisma(transaction);
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
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
      return null;
    }

    return Transaction.fromPrisma(transaction);
  }

  async findAllByUser(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transactions.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return transactions.map(transaction => Transaction.fromPrisma(transaction));
  }

  async findAllByUserForDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.prisma.transactions.findMany({
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

    return transactions.map(transaction => Transaction.fromPrisma(transaction));
  }

  async findAllByUserAndCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transactions.findMany({
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

    return transactions.map(transaction => Transaction.fromPrisma(transaction));
  }

  async findAllIncomeByUser(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        amount: { gt: 0 }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return transactions.map(transaction => Transaction.fromPrisma(transaction));
  }

  async findAllExpensesByUser(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        amount: { lt: 0 }
      },
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return transactions.map(transaction => Transaction.fromPrisma(transaction));
  }

  async update(id: string, userId: string, data: {
    categoryId?: string;
    amount?: number | Decimal;
    description?: string;
  }): Promise<Transaction> {
    const updateData: any = {};
    
    if (data.categoryId) {
      updateData.categoryId = BigInt(data.categoryId);
    }
    
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    
    const transaction = await this.prisma.transactions.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        category: true
      }
    });

    return Transaction.fromPrisma(transaction);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.prisma.transactions.delete({
      where: { id: BigInt(id) }
    });

    return true;
  }

  async getSummaryByCategory(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
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
      this.prisma.categories.findMany()
    ]);

    const categoryMap = new Map(categories.map(c => [c.id.toString(), c]));
    
    return transactions.map((t) => ({
      category: categoryMap.get(t.categoryId.toString()),
      totalAmount: t._sum.amount
    }));
  }

  async getTotalAmountByCategoryForUser(userId: string, categoryId: string): Promise<number> {
    const result = await this.prisma.transactions.aggregate({
      where: {
        userId,
        categoryId: BigInt(categoryId)
      },
      _sum: {
        amount: true
      }
    });

    // Handle case when no transactions found (sum would be null)
    return result._sum.amount ? Number(result._sum.amount) : 0;
  }
}
