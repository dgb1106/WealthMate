import { ConflictException, Global, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto): Promise<User> {
    const { email, password, ...rest } = registerDto;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = await this.prisma.users.create({
      data: {
        ...rest,
        email,
        hash_password: hashedPassword,
        current_balance: new Decimal(0),
        create_at: new Date(),
        updated_at: new Date(),
      },
    });

    return new User(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new User(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return new User(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);

    // Cập nhật thông tin người dùng
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        ...updateUserDto,
        updated_at: new Date(),
      },
    });

    return new User(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.prisma.users.delete({ where: { id } });
  }

  async updateBalance(id: string, amount: number): Promise<User> {
    const user = await this.getUserById(id);

    // Cập nhật số dư
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        current_balance: amount,
        updated_at: new Date(),
      },
    });

    return new User(updatedUser);
  }

  async getUserFinancialProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            transactions: true,
            goals: true,
            budgets: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currentBalance: user.current_balance,
      preferredMood: user.preferred_mood,
      preferredGoal: user.preferred_goal,
      transactionCount: user._count.transactions,
      goalCount: user._count.goals,
      budgetCount: user._count.budgets
    };
  }

  async getFinancialSummary(userId: string) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [
      monthlyTransactions,
      activeGoals,
      budgets,
      recurringTransactions
    ] = await Promise.all([
      this.prisma.transactions.findMany({
        where: {
          userId,
          created_at: { gte: firstDayOfMonth }
        },
        include: { category: true }
      }),
      this.prisma.goals.findMany({
        where: {
          userId,
          status: 'PENDING'
        }
      }),
      this.prisma.budgets.findMany({
        where: {
          userId,
          end_date: { gte: today }
        },
        include: { category: true }
      }),
      this.prisma.recurringTransactions.findMany({
        where: { userId },
        include: { category: true }
      })
    ]);
    
    const totalIncome = monthlyTransactions
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalExpenses = monthlyTransactions
      .filter(t => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const savingsRate = totalIncome > 0 ? 
      ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
    return {
      currentBalance: (await this.getUserById(userId)).getCurrentBalance(),
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      savingsRate,
      activeGoalsCount: activeGoals.length,
      activeBudgetsCount: budgets.length,
      upcomingRecurring: recurringTransactions.length,
      budgetHealth: this.calculateBudgetHealth(budgets),
      topSpendingCategories: this.getTopSpendingCategories(monthlyTransactions)
    };
  }
  
  private calculateBudgetHealth(budgets: any[]): string {
    // Calculate overall budget health based on spent vs limit amounts
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);
    const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
    
    if (totalLimit === 0) return 'NO_BUDGET';
    
    const ratio = totalSpent / totalLimit;
    if (ratio < 0.5) return 'EXCELLENT';
    if (ratio < 0.75) return 'GOOD';
    if (ratio < 1) return 'FAIR';
    return 'OVER_BUDGET';
  }
  
  private getTopSpendingCategories(transactions: any[], limit: number = 3) {
    const expensesByCategory = {};
    
    transactions.forEach(tx => {
      if (tx.amount < 0) {
        const categoryId = String(tx.categoryId);
        expensesByCategory[categoryId] = expensesByCategory[categoryId] || {
          categoryName: tx.category?.name || 'Unknown',
          amount: 0
        };
        expensesByCategory[categoryId].amount += Math.abs(Number(tx.amount));
      }
    });
    
    return Object.values(expensesByCategory)
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, limit);
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { hash_password: true }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const passwordValid = await bcrypt.compare(currentPassword, user.hash_password);
    if (!passwordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        hash_password: hashedNewPassword,
        updated_at: new Date()
      }
    });
    
    // Invalidate all existing tokens
    await this.prisma.jWT.deleteMany({
      where: { userId }
    });
    
    return { success: true };
  }
  
  async getAllUsers(): Promise<User[]> {
    const users = await this.prisma.users.findMany();
    return users.map(user => new User(user));
  }
}