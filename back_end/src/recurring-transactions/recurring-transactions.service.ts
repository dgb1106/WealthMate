import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringTransaction } from './entities/recurring-transactions.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transactions.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transactions.dto';
import { Frequency, TransactionType } from '../common/enums/enum';
import { Category } from '../categories/entities/categories.entity';

@Injectable()
export class RecurringTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateRecurringTransactionDto): Promise<RecurringTransaction> {
    try {
      // Kiểm tra danh mục tồn tại
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(createDto.categoryId) },
      });

      if (!category) {
        throw new NotFoundException(`Danh mục với ID ${createDto.categoryId} không tồn tại`);
      }

      // Tạo giao dịch định kỳ mới
      const recurringTransaction = await this.prisma.recurringTransactions.create({
        data: {
          userId,
          categoryId: BigInt(createDto.categoryId),
          amount: createDto.amount,
          frequency: createDto.frequency,
          next_occurence: new Date(createDto.next_occurence),
          created_at: new Date(),
          description: createDto.description,
        },
        include: {
          category: true,
        },
      });

      return this.mapToRecurringTransaction(recurringTransaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo giao dịch định kỳ');
    }
  }

  async findAll(userId: string): Promise<RecurringTransaction[]> {
    const transactions = await this.prisma.recurringTransactions.findMany({
      where: { userId },
      include: {
        category: true,
      },
    });

    return transactions.map(transaction => this.mapToRecurringTransaction(transaction));
  }

  async findOne(userId: string, id: string): Promise<RecurringTransaction> {
    const transaction = await this.prisma.recurringTransactions.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Giao dịch định kỳ với ID ${id} không tồn tại`);
    }

    return this.mapToRecurringTransaction(transaction);
  }

  async findUpcoming(userId: string, days: number = 7): Promise<RecurringTransaction[]> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    const transactions = await this.prisma.recurringTransactions.findMany({
      where: {
        userId,
        next_occurence: {
          gte: today,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        next_occurence: 'asc',
      },
    });

    return transactions.map(transaction => this.mapToRecurringTransaction(transaction));
  }

  async update(userId: string, id: string, updateDto: UpdateRecurringTransactionDto): Promise<RecurringTransaction> {
    // Kiểm tra giao dịch định kỳ tồn tại
    const transaction = await this.prisma.recurringTransactions.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Giao dịch định kỳ với ID ${id} không tồn tại`);
    }

    // Kiểm tra danh mục tồn tại nếu được cung cấp
    if (updateDto.categoryId) {
      const category = await this.prisma.categories.findUnique({
        where: { id: BigInt(updateDto.categoryId) },
      });

      if (!category) {
        throw new NotFoundException(`Danh mục với ID ${updateDto.categoryId} không tồn tại`);
      }
    }

    // Cập nhật giao dịch định kỳ
    const updatedTransaction = await this.prisma.recurringTransactions.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.categoryId && { categoryId: BigInt(updateDto.categoryId) }),
        ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
        ...(updateDto.frequency && { frequency: updateDto.frequency }),
        ...(updateDto.next_occurence && { next_occurence: new Date(updateDto.next_occurence) }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
      },
      include: {
        category: true,
      },
    });

    return this.mapToRecurringTransaction(updatedTransaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    // Kiểm tra giao dịch định kỳ tồn tại
    const transaction = await this.prisma.recurringTransactions.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Giao dịch định kỳ với ID ${id} không tồn tại`);
    }

    // Xóa giao dịch định kỳ
    await this.prisma.recurringTransactions.delete({
      where: { id: BigInt(id) },
    });
  }

  async processRecurringTransactions(userId?: string): Promise<number> {
    const today = new Date();
    
    // Lấy tất cả các giao dịch định kỳ đến hạn
    const query = {
      where: {
        next_occurence: {
          lte: today,
        },
        ...(userId && { userId }),
      },
      include: {
        category: true,
      },
    };
    
    const dueTransactions = await this.prisma.recurringTransactions.findMany(query);
    
    // Không có giao dịch nào cần xử lý
    if (dueTransactions.length === 0) {
      return 0;
    }
    
    let processedCount = 0;
    
    // Xử lý từng giao dịch định kỳ
    for (const transaction of dueTransactions) {
      try {
        // Tạo giao dịch thực tế
        await this.prisma.transactions.create({
          data: {
            userId: transaction.userId,
            categoryId: transaction.categoryId,
            amount: Number(transaction.amount),
            description: `${transaction.description} (Tự động từ giao dịch định kỳ)`,
            created_at: new Date(),
          },
        });
        
        // Cập nhật ngày xảy ra tiếp theo
        const nextOccurrence = this.calculateNextOccurrence(transaction.frequency as Frequency, new Date(transaction.next_occurence));
        
        await this.prisma.recurringTransactions.update({
          where: { id: transaction.id },
          data: {
            next_occurence: nextOccurrence,
          },
        });
        
        processedCount++;
      } catch (error) {
        console.error(`Lỗi khi xử lý giao dịch định kỳ ${transaction.id}:`, error);
      }
    }
    
    return processedCount;
  }

  private calculateNextOccurrence(frequency: Frequency, currentDate: Date): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case Frequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case Frequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case Frequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case Frequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  }

  private mapToRecurringTransaction(transaction: any): RecurringTransaction {
    return new RecurringTransaction({
      id: String(transaction.id),
      categoryId: String(transaction.categoryId),
      userId: String(transaction.userId),
      amount: Number(transaction.amount),
      frequency: transaction.frequency as Frequency,
      created_at: transaction.created_at,
      next_occurence: transaction.next_occurence,
      description: transaction.description,
      category: transaction.category 
        ? new Category({
            id: String(transaction.category.id),
            name: transaction.category.name,
            type: transaction.category.type as TransactionType
          })
        : undefined,
    });
  }
}
