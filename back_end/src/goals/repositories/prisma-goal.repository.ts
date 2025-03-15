import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { Goal } from '../entities/goal.entity';
import { GoalStatus } from '../../common/enums/enum';

export interface GoalRepository {
  create(userId: string, createGoalDto: CreateGoalDto): Promise<Goal>;
  findAll(userId: string): Promise<Goal[]>;
  findOne(id: string, userId: string): Promise<Goal | null>;
  update(id: string, userId: string, updateGoalDto: UpdateGoalDto): Promise<Goal>;
  remove(id: string, userId: string): Promise<void>;
  updateSavedAmount(id: string, userId: string, amount: number): Promise<Goal>;
  addFundsToGoal(id: string, userId: string, amount: number): Promise<Goal>;
  findActiveGoals(userId: string): Promise<Goal[]>;
  findCompletedGoals(userId: string): Promise<Goal[]>;
  findOverdueGoals(userId: string): Promise<Goal[]>;
  findGoalsNearingDeadline(userId: string, daysThreshold: number): Promise<Goal[]>;
  transferFundsBetweenGoals(sourceGoalId: string, targetGoalId: string, userId: string, amount: number): Promise<{ sourceGoal: Goal; targetGoal: Goal }>;
}

@Injectable()
export class PrismaGoalRepository implements GoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalDto): Promise<Goal> {
    const goal = Goal.create({
      userId, 
      name: createGoalDto.name,
      target_amount: createGoalDto.target_amount,
      saved_amount: createGoalDto.saved_amount || 0,
      due_date: new Date(createGoalDto.due_date)
    });
    
    const savedGoal = await this.prisma.goals.create({
      data: {
        userId: goal.userId,
        name: goal.name,
        target_amount: goal.target_amount,
        saved_amount: goal.saved_amount,
        status: goal.status,
        due_date: goal.due_date,
        created_at: goal.created_at
      }
    });
    
    return Goal.fromPrisma(savedGoal);
  }

  async findAll(userId: string): Promise<Goal[]> {
    const goals = await this.prisma.goals.findMany({
      where: { userId },
      orderBy: { due_date: 'asc' }
    });
    
    return Goal.fromPrismaArray(goals);
  }

  async findOne(id: string, userId: string): Promise<Goal | null> {
    const goal = await this.prisma.goals.findFirst({
      where: { id: BigInt(id), userId }
    });
    
    if (!goal) return null;
    return Goal.fromPrisma(goal);
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    const existingGoal = await this.findOne(id, userId);
    if (!existingGoal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (updateGoalDto.name !== undefined) updateData.name = updateGoalDto.name;
    if (updateGoalDto.target_amount !== undefined) updateData.target_amount = updateGoalDto.target_amount;
    if (updateGoalDto.due_date !== undefined) updateData.due_date = new Date(updateGoalDto.due_date);
    
    // Handle saved amount and status updates
    if (updateGoalDto.saved_amount !== undefined) {
      const goalEntity = Goal.fromPrisma(existingGoal);
      const amountDifference = updateGoalDto.saved_amount - existingGoal.saved_amount;
      goalEntity.addFunds(amountDifference);
      
      updateData.saved_amount = goalEntity.saved_amount;
      updateData.status = goalEntity.status;
    } else if (updateGoalDto.status !== undefined) {
      updateData.status = updateGoalDto.status;
    }
    
    const updatedGoal = await this.prisma.goals.update({
      where: { id: BigInt(id) },
      data: updateData
    });
    
    return Goal.fromPrisma(updatedGoal);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingGoal = await this.findOne(id, userId);
    if (!existingGoal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    
    await this.prisma.goals.delete({
      where: { id: BigInt(id) }
    });
  }

  async updateSavedAmount(id: string, userId: string, amount: number): Promise<Goal> {
    const existingGoal = await this.findOne(id, userId);
    if (!existingGoal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    
    const goalEntity = Goal.fromPrisma(existingGoal);
    goalEntity.updateSavedAmount(amount);
    
    const updatedGoal = await this.prisma.goals.update({
      where: { id: BigInt(id) },
      data: {
        saved_amount: goalEntity.saved_amount,
        status: goalEntity.status
      }
    });
    
    return Goal.fromPrisma(updatedGoal);
  }

  async addFundsToGoal(id: string, userId: string, amount: number): Promise<Goal> {
    // Start a transaction to update both goal and user balance
    return this.prisma.$transaction(async (prisma) => {
      // Verify user has enough balance
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if the user has enough balance
      const currentBalance = Number(user.current_balance || 0);
      if (currentBalance < amount) {
        throw new BadRequestException(`Insufficient balance. Available: ${currentBalance}, Required: ${amount}`);
      }

      // Add funds to goal
      const updatedGoal = await prisma.goals.update({
        where: {
          id: BigInt(id),
          userId
        },
        data: {
          saved_amount: {
            increment: amount
          }
        }
      });
      
      // Update user balance
      await prisma.users.update({
        where: { id: userId },
        data: { current_balance: { decrement: amount } }
      });

      return Goal.fromPrisma(updatedGoal);
    });
  }

  async transferFundsBetweenGoals(
    sourceGoalId: string, 
    targetGoalId: string, 
    userId: string, 
    amount: number
  ): Promise<{ sourceGoal: Goal; targetGoal: Goal }> {
    // Execute the transfer in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Reduce amount from source goal
      const updatedSourceGoal = await prisma.goals.update({
        where: { 
          id: BigInt(sourceGoalId),
          userId
        },
        data: {
          saved_amount: {
            decrement: amount
          }
        }
      });
      
      // Add amount to target goal
      const updatedTargetGoal = await prisma.goals.update({
        where: {
          id: BigInt(targetGoalId),
          userId
        },
        data: {
          saved_amount: {
            increment: amount
          }
        }
      });

      return { 
        sourceGoal: Goal.fromPrisma(updatedSourceGoal), 
        targetGoal: Goal.fromPrisma(updatedTargetGoal) 
      };
    });
  }

  async findActiveGoals(userId: string): Promise<Goal[]> {
    const today = new Date();
    
    const goals = await this.prisma.goals.findMany({
      where: {
        userId,
        status: { not: GoalStatus.COMPLETED },
        due_date: { gt: today }
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Goal.fromPrismaArray(goals);
  }

  async findCompletedGoals(userId: string): Promise<Goal[]> {
    const goals = await this.prisma.goals.findMany({
      where: {
        userId,
        status: GoalStatus.COMPLETED
      },
      orderBy: { due_date: 'desc' }
    });
    
    return Goal.fromPrismaArray(goals);
  }

  async findOverdueGoals(userId: string): Promise<Goal[]> {
    const today = new Date();
    
    const goals = await this.prisma.goals.findMany({
      where: {
        userId,
        status: { not: GoalStatus.COMPLETED },
        due_date: { lt: today }
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Goal.fromPrismaArray(goals);
  }

  async findGoalsNearingDeadline(userId: string, daysThreshold: number = 30): Promise<Goal[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    const goals = await this.prisma.goals.findMany({
      where: {
        userId,
        status: { not: GoalStatus.COMPLETED },
        due_date: {
          gt: today,
          lt: thresholdDate
        }
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Goal.fromPrismaArray(goals);
  }
}
