import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyTransactionContributionRepository } from './family-transaction-contribution-repository.interface';
import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { ContributionType, GoalStatus } from '../../common/enums/enum';

@Injectable()
export class PrismaFamilyTransactionContributionRepository implements FamilyTransactionContributionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createContributionDto: CreateFamilyTransactionContributionDto): Promise<FamilyTransactionContribution> {
    return this.prisma.$transaction(async (prisma) => {
      // Validate the transaction exists and belongs to the user
      const transaction = await prisma.transactions.findUnique({
        where: { id: BigInt(createContributionDto.transactionId) }
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${createContributionDto.transactionId} not found`);
      }

      if (transaction.userId !== userId) {
        throw new BadRequestException('You can only contribute your own transactions');
      }

      // Validate the group exists and user is a member
      const member = await prisma.familyMembers.findFirst({
        where: {
          userId,
          groupId: BigInt(createContributionDto.groupId)
        }
      });

      if (!member) {
        throw new BadRequestException('You are not a member of this group');
      }

      // Validate the target exists based on contribution type
      if (createContributionDto.contributionType === ContributionType.BUDGET) {
        const budget = await prisma.familyBudgets.findUnique({
          where: { id: BigInt(createContributionDto.targetId) },
          include: { category: true }
        });

        if (!budget) {
          throw new NotFoundException(`Budget with ID ${createContributionDto.targetId} not found`);
        }

        if (budget.groupId !== BigInt(createContributionDto.groupId)) {
          throw new BadRequestException('Budget does not belong to the specified group');
        }

        // Check if the transaction's category matches the budget's category
        if (transaction.categoryId !== budget.categoryId) {
          throw new BadRequestException('Transaction category does not match budget category');
        }

        // Update the budget's spent amount
        await prisma.familyBudgets.update({
          where: { id: budget.id },
          data: { spent_amount: { increment: createContributionDto.amount } }
        });
      } else if (createContributionDto.contributionType === ContributionType.GOAL) {
        const goal = await prisma.familyGoals.findUnique({
          where: { id: BigInt(createContributionDto.targetId) }
        });

        if (!goal) {
          throw new NotFoundException(`Goal with ID ${createContributionDto.targetId} not found`);
        }

        if (goal.groupId !== BigInt(createContributionDto.groupId)) {
          throw new BadRequestException('Goal does not belong to the specified group');
        }

        // Update the goal's saved amount and potentially status
        const newSavedAmount = Number(goal.saved_amount) + createContributionDto.amount;
        let newStatus = goal.status;
        if (newSavedAmount >= Number(goal.target_amount)) {
          newStatus = GoalStatus.COMPLETED;
        } else if (newSavedAmount > 0 && goal.status === GoalStatus.PENDING) {
          newStatus = GoalStatus.IN_PROGRESS;
        }

        await prisma.familyGoals.update({
          where: { id: goal.id },
          data: { 
            saved_amount: newSavedAmount,
            status: newStatus
          }
        });
      } else {
        throw new BadRequestException('Invalid contribution type');
      }

      // Create the contribution record
      const contribution = await prisma.familyTransactionContributions.create({
        data: {
          transactionId: BigInt(createContributionDto.transactionId),
          groupId: BigInt(createContributionDto.groupId),
          amount: createContributionDto.amount,
          contributionType: createContributionDto.contributionType,
          targetId: BigInt(createContributionDto.targetId),
          created_at: new Date()
        },
        include: {
          transaction: {
            include: {
              user: true
            }
          },
          group: true,
          familyBudget: createContributionDto.contributionType === ContributionType.BUDGET,
          familyGoal: createContributionDto.contributionType === ContributionType.GOAL
        }
      });

      return FamilyTransactionContribution.fromPrisma(contribution);
    });
  }

  async findAll(groupId: string): Promise<FamilyTransactionContribution[]> {
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        group: true,
        familyBudget: true,
        familyGoal: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async findByTransaction(transactionId: string): Promise<FamilyTransactionContribution[]> {
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { transactionId: BigInt(transactionId) },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        group: true,
        familyBudget: true,
        familyGoal: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async findByTarget(targetId: string, contributionType: string): Promise<FamilyTransactionContribution[]> {
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { 
        targetId: BigInt(targetId),
        contributionType
      },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        group: true,
        familyBudget: true,
        familyGoal: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async findByUser(userId: string, groupId: string): Promise<FamilyTransactionContribution[]> {
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { 
        groupId: BigInt(groupId),
        transaction: {
          userId
        }
      },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        group: true,
        familyBudget: true,
        familyGoal: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.prisma.$transaction(async (prisma) => {
      // Find the contribution
      const contribution = await prisma.familyTransactionContributions.findUnique({
        where: { id: BigInt(id) },
        include: {
          transaction: true
        }
      });

      if (!contribution) {
        throw new NotFoundException(`Contribution with ID ${id} not found`);
      }

      // Check ownership
      if (contribution.transaction.userId !== userId) {
        // Check if user is admin or owner of the group
        const member = await prisma.familyMembers.findFirst({
          where: {
            userId,
            groupId: contribution.groupId,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        });

        if (!member) {
          throw new BadRequestException('You do not have permission to remove this contribution');
        }
      }

      // Undo the contribution based on type
      if (contribution.contributionType === ContributionType.BUDGET) {
        // Reverse the budget spent amount update
        await prisma.familyBudgets.update({
          where: { id: contribution.targetId },
          data: { spent_amount: { decrement: Number(contribution.amount) } }
        });
      } else if (contribution.contributionType === ContributionType.GOAL) {
        // Get the goal
        const goal = await prisma.familyGoals.findUnique({
          where: { id: contribution.targetId }
        });

        if (goal) {
          // Calculate new saved amount
          const newSavedAmount = Math.max(0, Number(goal.saved_amount) - Number(contribution.amount));
          
          // Determine new status
          let newStatus = goal.status;
          if (newSavedAmount === 0) {
            newStatus = GoalStatus.PENDING;
          } else if (newSavedAmount < Number(goal.target_amount)) {
            newStatus = GoalStatus.IN_PROGRESS;
          }
          // If it's already completed and still meets target, keep as completed

          // Update the goal
          await prisma.familyGoals.update({
            where: { id: goal.id },
            data: { 
              saved_amount: newSavedAmount,
              status: newStatus
            }
          });
        }
      }

      // Delete the contribution
      await prisma.familyTransactionContributions.delete({
        where: { id: BigInt(id) }
      });
    });
  }

  async getGroupContributionStats(groupId: string): Promise<any> {
    const group = await this.prisma.familyGroups.findUnique({
      where: { id: BigInt(groupId) }
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Get all contributions for this group
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        transaction: {
          include: {
            user: true
          }
        }
      }
    });

    // Group contributions by user
    const userContributions = new Map<string, { 
      userId: string,
      userName: string,
      totalAmount: number,
      contributionsCount: number,
      budgetContributions: number,
      goalContributions: number
    }>();

    contributions.forEach(contribution => {
      const userId = contribution.transaction.userId;
      const userName = contribution.transaction.user.name;

      if (!userContributions.has(userId)) {
        userContributions.set(userId, {
          userId,
          userName,
          totalAmount: 0,
          contributionsCount: 0,
          budgetContributions: 0,
          goalContributions: 0
        });
      }

      const userStats = userContributions.get(userId);
      userStats.totalAmount += Number(contribution.amount);
      userStats.contributionsCount += 1;

      if (contribution.contributionType === ContributionType.BUDGET) {
        userStats.budgetContributions += 1;
      } else if (contribution.contributionType === ContributionType.GOAL) {
        userStats.goalContributions += 1;
      }
    });

    // Calculate totals
    const totalAmount = Array.from(userContributions.values())
      .reduce((sum, user) => sum + user.totalAmount, 0);
    const totalContributions = contributions.length;
    const budgetContributions = contributions
      .filter(c => c.contributionType === ContributionType.BUDGET).length;
    const goalContributions = contributions
      .filter(c => c.contributionType === ContributionType.GOAL).length;

    // Format results
    return {
      groupId: String(group.id),
      groupName: group.name,
      totalAmount,
      totalContributions,
      budgetContributions,
      goalContributions,
      contributorCount: userContributions.size,
      contributorStats: Array.from(userContributions.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
    };
  }
}
