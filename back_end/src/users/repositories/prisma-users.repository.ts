import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/users.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersRepository } from './users-repository.interface';
import { RegisterDto } from '../../auth/dto/register.dto';
import { PreferredGoal, PreferredMood } from '../../common/enums/enum';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto, hashedPassword: string): Promise<User> {
    const { email, preferred_mood, preferred_goal, ...rest } = registerDto;
    
    const userData = {
      ...rest,
      email,
      hash_password: hashedPassword,
      preferred_mood: preferred_mood as PreferredMood,
      preferred_goal: preferred_goal as PreferredGoal,
      current_balance: new Decimal(0),
      create_at: new Date(),
      updated_at: new Date(),
    };

    const createdUser = await this.prisma.users.create({ data: userData });
    return User.fromPrisma(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    return user ? User.fromPrisma(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    return user ? User.fromPrisma(user) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({ where: { phone } });
    return user ? User.fromPrisma(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.users.update({
      where: { id },
      data: {
        ...updateUserDto,
        updated_at: new Date(),
      },
    });
    return User.fromPrisma(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.users.delete({ where: { id } });
  }

  async updateBalance(id: string, amount: number): Promise<User> {
    const user = await this.prisma.users.update({
      where: { id },
      data: {
        current_balance: amount,
      },
    });
    return User.fromPrisma(user);
  }

  async increaseBalance(id: string, amount: number): Promise<User> {
    const user = await this.prisma.users.update({
      where: { id },
      data: {
        current_balance: {
          increment: amount
        },
      },
    });
    return User.fromPrisma(user);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<{ success: boolean }> {
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        hash_password: hashedPassword,
        updated_at: new Date()
      }
    });
    
    return { success: true };
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.prisma.jWT.deleteMany({
      where: { userId }
    });
  }

  async getUserPasswordHash(userId: string): Promise<string | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { hash_password: true }
    });
    
    return user ? user.hash_password : null;
  }

}
