import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyGoalRepository } from './family-goal-repository.interface';
import { FamilyGoal } from '../entities/family-goal.entity';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';
import { FamilyMemberRole, GoalStatus } from '../../common/enums/enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaFamilyGoalRepository implements FamilyGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(groupId: string, userId: string, createGoalDto: CreateFamilyGoalDto): Promise<FamilyGoal> {
    // Check if the user is a member of the group with appropriate permissions
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: BigInt(groupId),
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (!member) {
      throw new BadRequestException('You do not have permission to create goals for this group');
    }

    // Check date validity
    const dueDate = new Date(createGoalDto.due_date);
    const today = new Date();

    if (dueDate <= today) {
      throw new BadRequestException('Due date must be in the future');
    }

    // Determine initial status
    let initialStatus: GoalStatus;
    if (createGoalDto.saved_amount && createGoalDto.saved_amount >= createGoalDto.target_amount) {
      initialStatus = GoalStatus.COMPLETED;
    } else if (createGoalDto.saved_amount && createGoalDto.saved_amount > 0) {
      initialStatus = GoalStatus.IN_PROGRESS;
    } else {
      initialStatus = GoalStatus.PENDING;
    }

    // Create the goal
    const goalData = await this.prisma.familyGoals.create({
      data: {
        groupId: BigInt(groupId),
        name: createGoalDto.name,
        target_amount: createGoalDto.target_amount,
        saved_amount: createGoalDto.saved_amount || 0,
        status: initialStatus,
        due_date: dueDate,
        created_at: new Date(),
        created_by: userId
      },
      include: {
        creator: true,
        group: true
      }
    });

    return FamilyGoal.fromPrisma(goalData);
  }

  async findAll(groupId: string, options?: { page?: number, limit?: number, includeDetails?: boolean }): Promise<{ data: FamilyGoal[], total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const includeDetails = options?.includeDetails ?? false;

    // Use Promise.all for parallel execution and count
    const [goals, total] = await Promise.all([
      this.prisma.familyGoals.findMany({
        where: { groupId: BigInt(groupId) },
        include: {
          creator: includeDetails ? true : {
            select: { id: true, name: true }
          },
          // Only include minimal group data to reduce payload
          group: includeDetails ? true : {
            select: { id: true, name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.familyGoals.count({
        where: { groupId: BigInt(groupId) }
      })
    ]);

    return {
      data: FamilyGoal.fromPrismaArray(goals),
      total
    };
  }

  async findOne(id: string): Promise<FamilyGoal | null> {
    try {
      const goal = await this.prisma.familyGoals.findUnique({
        where: { id: BigInt(id) },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          group: {
            select: { id: true, name: true }
          }
        }
      });

      return goal ? FamilyGoal.fromPrisma(goal) : null;
    } catch (error) {
      // Proper error handling
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        if (error.code === 'P2023') { // Invalid ID format
          return null;
        }
      }
      throw error;
    }
  }

  async update(id: string, userId: string, updateGoalDto: UpdateFamilyGoalDto): Promise<FamilyGoal> {
    // Get the goal to update
    const goal = await this.prisma.familyGoals.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check permissions: only group admin/owner or goal creator can update
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: goal.groupId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (goal.created_by !== userId && !member) {
      throw new BadRequestException('You do not have permission to update this goal');
    }

    // Prepare the update data
    const updateData: any = {};

    if (updateGoalDto.name) {
      updateData.name = updateGoalDto.name;
    }

    if (updateGoalDto.target_amount !== undefined) {
      updateData.target_amount = updateGoalDto.target_amount;
    }

    if (updateGoalDto.saved_amount !== undefined) {
      updateData.saved_amount = updateGoalDto.saved_amount;
    }

    // Update status based on saved amount and target amount
    if (updateData.saved_amount !== undefined || updateData.target_amount !== undefined) {
      const savedAmount = updateData.saved_amount !== undefined ? updateData.saved_amount : Number(goal.saved_amount);
      const targetAmount = updateData.target_amount !== undefined ? updateData.target_amount : Number(goal.target_amount);
      
      if (savedAmount >= targetAmount) {
        updateData.status = GoalStatus.COMPLETED;
      } else if (savedAmount > 0) {
        updateData.status = GoalStatus.IN_PROGRESS;
      } else {
        updateData.status = GoalStatus.PENDING;
      }
    }

    if (updateGoalDto.status) {
      updateData.status = updateGoalDto.status;
    }

    if (updateGoalDto.due_date) {
      const dueDate = new Date(updateGoalDto.due_date);
      // Only validate if we're not updating a completed goal
      if (updateData.status !== GoalStatus.COMPLETED && goal.status !== GoalStatus.COMPLETED && dueDate <= new Date()) {
        throw new BadRequestException('Due date must be in the future');
      }
      updateData.due_date = dueDate;
    }

    // Update the goal
    const updatedGoal = await this.prisma.familyGoals.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        creator: true,
        group: true
      }
    });

    return FamilyGoal.fromPrisma(updatedGoal);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Get the goal to delete
    const goal = await this.prisma.familyGoals.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check permissions: only group admin/owner or goal creator can delete
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        userId,
        groupId: goal.groupId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (goal.created_by !== userId && !member) {
      throw new BadRequestException('You do not have permission to delete this goal');
    }

    // Delete the goal
    await this.prisma.familyGoals.delete({
      where: { id: BigInt(id) }
    });
  }

  async findActiveByGroup(groupId: string): Promise<FamilyGoal[]> {
    const goals = await this.prisma.familyGoals.findMany({
      where: {
        groupId: BigInt(groupId),
        status: {
          in: [GoalStatus.PENDING, GoalStatus.IN_PROGRESS]
        }
      },
      include: {
        creator: true
      },
      orderBy: { due_date: 'asc' }
    });

    return FamilyGoal.fromPrismaArray(goals);
  }

  async incrementSavedAmount(id: string, amount: number): Promise<FamilyGoal> {
    const goal = await this.prisma.familyGoals.findUnique({
      where: { id: BigInt(id) }
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Calculate new saved amount
    const newSavedAmount = Number(goal.saved_amount) + amount;
    
    // Determine new status
    let newStatus = goal.status;
    if (newSavedAmount >= Number(goal.target_amount)) {
      newStatus = GoalStatus.COMPLETED;
    } else if (newSavedAmount > 0 && newStatus === GoalStatus.PENDING) {
      newStatus = GoalStatus.IN_PROGRESS;
    }

    const updatedGoal = await this.prisma.familyGoals.update({
      where: { id: BigInt(id) },
      data: { 
        saved_amount: newSavedAmount,
        status: newStatus
      },
      include: {
        creator: true,
        group: true
      }
    });

    return FamilyGoal.fromPrisma(updatedGoal);
  }

  async getGroupGoalsSummary(groupId: string): Promise<any> {
    const group = await this.prisma.familyGroups.findUnique({
      where: { id: BigInt(groupId) }
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Get all goals
    const goals = await this.prisma.familyGoals.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        creator: true
      }
    });

    // Group goals by status
    const pendingGoals = goals.filter(goal => goal.status === GoalStatus.PENDING);
    const inProgressGoals = goals.filter(goal => goal.status === GoalStatus.IN_PROGRESS);
    const completedGoals = goals.filter(goal => goal.status === GoalStatus.COMPLETED);

    // Calculate totals
    const pendingTotal = pendingGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
    const inProgressTotal = inProgressGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
    const inProgressSaved = inProgressGoals.reduce((sum, goal) => sum + Number(goal.saved_amount), 0);
    const completedTotal = completedGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);

    return {
      groupId: String(group.id),
      groupName: group.name,
      totalGoals: goals.length,
      pendingGoals: pendingGoals.length,
      inProgressGoals: inProgressGoals.length,
      completedGoals: completedGoals.length,
      pendingTotal,
      inProgressTotal,
      inProgressSaved,
      completedTotal,
      overallCompletionPercentage: Math.round((completedGoals.length / Math.max(1, goals.length)) * 100)
    };
  }

  async addFundsToGoal(id: string, userId: string, amount: number): Promise<FamilyGoal> {
    const goal = await this.prisma.familyGoals.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Calculate new saved amount and update status if needed
    const newSavedAmount = Number(goal.saved_amount) + amount;
    
    // Determine new status
    let newStatus = goal.status;
    if (newSavedAmount >= Number(goal.target_amount)) {
      newStatus = GoalStatus.COMPLETED;
    } else if (newStatus === GoalStatus.PENDING && newSavedAmount > 0) {
      newStatus = GoalStatus.IN_PROGRESS;
    }

    const updatedGoal = await this.prisma.familyGoals.update({
      where: { id: BigInt(id) },
      data: {
        saved_amount: newSavedAmount,
        status: newStatus
      },
      include: {
        creator: true,
        group: true
      }
    });

    return FamilyGoal.fromPrisma(updatedGoal);
  }

  async withdrawFundsFromGoal(id: string, userId: string, amount: number): Promise<FamilyGoal> {
    const goal = await this.prisma.familyGoals.findUnique({
      where: { id: BigInt(id) },
      include: { group: true }
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check if there are sufficient funds
    if (Number(goal.saved_amount) < amount) {
      throw new BadRequestException(`Insufficient funds. Available: ${goal.saved_amount}, Requested: ${amount}`);
    }

    // Calculate new saved amount
    const newSavedAmount = Number(goal.saved_amount) - amount;
    
    // Determine new status
    let newStatus = goal.status;
    if (newSavedAmount <= 0) {
      newStatus = GoalStatus.PENDING;
    } else if (newSavedAmount < Number(goal.target_amount) && goal.status === GoalStatus.COMPLETED) {
      newStatus = GoalStatus.IN_PROGRESS;
    }

   
    const updatedGoal = await this.prisma.familyGoals.update({
      where: { id: BigInt(id) },
        data: {
          saved_amount: newSavedAmount,
          status: newStatus
        },
        include: {
          creator: true,
          group: true
        }
      });

    return FamilyGoal.fromPrisma(updatedGoal);
  }
}
