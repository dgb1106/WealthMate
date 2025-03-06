import { RecurringTransaction } from './../recurring-transactions/entities/recurring-transactions.entity';
import { ConflictException, Global, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PreferredMood, PreferredGoal } from 'src/common/enums/enum';
import { GlobalVariables } from 'src/GlobalVariables';
import * as bcrypt from 'bcrypt';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';


@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, id: string) {}

  async getAllUsers() {
    return this.prisma.users.findMany();
  }

  async getUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.getUserByEmail(email);

    const isValidPassword = await bcrypt.compare(password, user.hash_password);

    if (!isValidPassword) {
      throw new ConflictException('Invalid password');
    }

    const { hash_password, ...result } = user;

    GlobalVariables.currentUser = new User(result);
    
    return result;
  }

  async updateBalance(id: string, amount: number) {
    return this.prisma.users.update({
      where: { id },
      data: {
        current_balance: GlobalVariables.currentUser.getCurrentBalance() + amount,
        updated_at: new Date(),
      }
    });
  }

  async updateLoansBalance(loanId: string, amount: number) {
    let convertedLoanId = BigInt(loanId);

    const loan = await this.prisma.loans.findUnique({
      where: { id: convertedLoanId },
    });

    if (!loan) {
      throw new ConflictException('Loan not found');
    }

    loan.total_amount.add(amount);

    return this.prisma.loans.update({
      where: { id: convertedLoanId },
      data: {
        total_amount: loan.total_amount,
      }
    });
  }

  async getUserTransactions(id: string) {
    const transactions = await this.prisma.transactions.findMany({
      where: { userId: id },
      include: { category: true },
    });

    GlobalVariables.currentUser.setTransactions(transactions);

    return transactions;
  }

  async getCurrentTransactionsList() {
    return GlobalVariables.currentUser.getTransactions();
  }

  async getUserRecurringTransactions(id: string) {
    const recurringTransactions = await this.prisma.recurringTransactions.findMany({
      where: { userId: id },
      include: { category: true },
    });

    GlobalVariables.currentUser.setRecurringTransactions(recurringTransactions);

    return recurringTransactions;
  }

  async getCurrentRecurringTransactionsList() {
    return GlobalVariables.currentUser.getRecurringTransactions();
  }

  async getUserBudgets(id: string) {
    const budgets = await this.prisma.budgets.findMany({
      where: { userId: id },
    });

    GlobalVariables.currentUser.setBudgets(budgets);

    return budgets;
  }

  async getCurrentBudgetsList() {
    return GlobalVariables.currentUser.getBudgets();
  }

  async getUserGoals(id: string) {
    const goals = await this.prisma.goals.findMany({
      where: { userId: id },
    });

    GlobalVariables.currentUser.setGoals(goals);

    return goals;
  }

  async getCurrentGoalsList() {
    return GlobalVariables.currentUser.getGoals();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    // If email is being updated, check if it's already in use
    if (updateUserDto.email && updateUserDto.email !== GlobalVariables.currentUser.getEmail()) {
      const existingEmail = await this.prisma.users.findUnique({
        where: { email: updateUserDto.email },
      });
  
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }
  
    // If phone is being updated, check if it's already in use
    if (updateUserDto.phone && updateUserDto.phone !== GlobalVariables.currentUser.getPhone()) {
      const existingPhone = await this.prisma.users.findUnique({
        where: { phone: updateUserDto.phone },
      });
  
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }
  
    // Prepare data object for update
    const updateData: any = {};
    
    // Map fields from DTO to database field names
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;
    if (updateUserDto.city !== undefined) updateData.city = updateUserDto.city;
    if (updateUserDto.district !== undefined) updateData.district = updateUserDto.district;
    if (updateUserDto.job !== undefined) updateData.job = updateUserDto.job;
    if (updateUserDto.preferredMood !== undefined) updateData.preferred_mood = updateUserDto.preferredMood;
    if (updateUserDto.preferredGoal !== undefined) updateData.preferred_goal = updateUserDto.preferredGoal;
    
    // Always update the updatedAt timestamp
    updateData.updated_at = new Date();
  
    // Update the user
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  
    // Don't return the hashed password
    const { ...result } = updatedUser;
    return result;
  }
  
  async createUser(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Check if phone already exists
    const existingPhone = await this.prisma.users.findUnique({
      where: { phone: registerDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already in use');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create new user
    const newUser = await this.prisma.users.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        city: registerDto.city,
        district: registerDto.district,
        job: registerDto.job,
        preferred_mood: registerDto.preferred_mood,
        preferred_goal: registerDto.preferred_goal,
        hash_password: hashedPassword,
        current_balance: 0,
        create_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Return user without password
    const { hash_password, ...result } = newUser;
    return result;
  }

  async deleteUser(id: string) {
    return this.prisma.users.delete({
      where: { id },
    });
  }
}