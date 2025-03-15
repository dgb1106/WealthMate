import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecurringTransactionRepository } from './recurring-transaction-repository.interface';
import { RecurringTransaction } from '../entities/recurring-transaction.entity';
import { Frequency } from '../../common/enums/enum';
import { CreateRecurringTransactionDto } from '../dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from '../dto/update-recurring-transaction.dto';

@Injectable()
export class PrismaRecurringTransactionRepository implements RecurringTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateRecurringTransactionDto): Promise<RecurringTransaction> {
    // Create recurring transaction entity
    const entity = RecurringTransaction.create({
      userId,
      categoryId: createDto.categoryId,
      amount: createDto.amount,
      frequency: createDto.frequency,
      description: createDto.description,
      next_occurence: new Date(createDto.next_occurence)
    });
    
    // Save to database
    const recurringTx = await this.prisma.recurringTransactions.create({
      data: {
        userId: entity.userId,
        categoryId: BigInt(entity.categoryId),
        amount: entity.amount,
        frequency: entity.frequency,
        description: entity.description,
        next_occurence: entity.next_occurence,
        created_at: entity.created_at
      },
      include: {
        category: true
      }
    });
    
    return RecurringTransaction.fromPrisma(recurringTx);
  }

  async findAll(userId: string): Promise<RecurringTransaction[]> {
    const recurringTxs = await this.prisma.recurringTransactions.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { next_occurence: 'asc' }
    });
    
    return RecurringTransaction.fromPrismaArray(recurringTxs);
  }

  async findById(id: string, userId: string): Promise<RecurringTransaction | null> {
    const recurringTx = await this.prisma.recurringTransactions.findFirst({
      where: {
        id: BigInt(id),
        userId
      },
      include: { category: true }
    });
    
    if (!recurringTx) return null;
    
    return RecurringTransaction.fromPrisma(recurringTx);
  }

  async findDueTransactions(date = new Date()): Promise<RecurringTransaction[]> {
    const recurringTxs = await this.prisma.recurringTransactions.findMany({
      where: {
        next_occurence: { 
          lte: date
        }
      },
      include: { category: true },
      orderBy: { next_occurence: 'asc' }
    });
    
    return RecurringTransaction.fromPrismaArray(recurringTxs);
  }

  async findByFrequency(userId: string, frequency: Frequency): Promise<RecurringTransaction[]> {
    const recurringTxs = await this.prisma.recurringTransactions.findMany({
      where: {
        userId,
        frequency
      },
      include: { category: true },
      orderBy: { next_occurence: 'asc' }
    });
    
    return RecurringTransaction.fromPrismaArray(recurringTxs);
  }

  async findByCategory(userId: string, categoryId: string): Promise<RecurringTransaction[]> {
    const recurringTxs = await this.prisma.recurringTransactions.findMany({
      where: {
        userId,
        categoryId: BigInt(categoryId)
      },
      include: { category: true },
      orderBy: { next_occurence: 'asc' }
    });
    
    return RecurringTransaction.fromPrismaArray(recurringTxs);
  }

  async findActiveByUser(userId: string): Promise<RecurringTransaction[]> {
    // Vì không có trường is_active trong schema, chúng ta chỉ trả về tất cả giao dịch định kỳ
    return this.findAll(userId);
  }
  
  async update(id: string, userId: string, updateDto: UpdateRecurringTransactionDto): Promise<RecurringTransaction> {
    const existingTx = await this.findById(id, userId);
    if (!existingTx) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    // Khởi tạo updateData trước khi sử dụng
    const updateData: any = {};
    
    if (updateDto.categoryId !== undefined) updateData.categoryId = BigInt(updateDto.categoryId);
    if (updateDto.amount !== undefined) updateData.amount = updateDto.amount;
    if (updateDto.frequency !== undefined) updateData.frequency = updateDto.frequency;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.next_occurence !== undefined) updateData.next_occurence = new Date(updateDto.next_occurence);
    
    const updatedTx = await this.prisma.recurringTransactions.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { category: true }
    });
    
    return RecurringTransaction.fromPrisma(updatedTx);
  }

  async updateNextOccurrence(id: string, userId: string, nextOccurence: Date): Promise<RecurringTransaction> {
    const existingTx = await this.findById(id, userId);
    if (!existingTx) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    const updatedTx = await this.prisma.recurringTransactions.update({
      where: { id: BigInt(id) },
      data: {
        next_occurence: nextOccurence
      },
      include: { category: true }
    });
    
    return RecurringTransaction.fromPrisma(updatedTx);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existingTx = await this.findById(id, userId);
    if (!existingTx) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    
    await this.prisma.recurringTransactions.delete({
      where: { id: BigInt(id) }
    });
    
    return true;
  }

  async getUpcomingTransactions(userId: string, days: number): Promise<RecurringTransaction[]> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const recurringTxs = await this.prisma.recurringTransactions.findMany({
      where: {
        userId,
        next_occurence: {
          gte: today,
          lte: endDate
        }
      },
      include: { category: true },
      orderBy: { next_occurence: 'asc' }
    });
    
    return RecurringTransaction.fromPrismaArray(recurringTxs);
  }
}
