import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyTransactionContributionRepository } from './family-transaction-contribution-repository.interface';
import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { ContributionType } from '../../common/enums/enum';

// Define interface for user contributions to fix type errors
interface UserContribution {
  userId: string;
  userName: string;
  total: number;
  budgetContributions: number;
  goalContributions: number;
  count: number;
}

@Injectable()
export class PrismaFamilyTransactionContributionRepository implements FamilyTransactionContributionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createContributionDto: any): Promise<FamilyTransactionContribution> {
    return this.prisma.$transaction(async (prisma) => {
      // Verify the transaction exists and belongs to the user
      const transaction = await prisma.transactions.findFirst({
        where: {
          id: BigInt(createContributionDto.transactionId),
          userId: userId
        },
        include: {
          category: true
        }
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${createContributionDto.transactionId} not found`);
      }

      // Validate the group exists
      const group = await prisma.familyGroups.findUnique({
        where: { id: BigInt(createContributionDto.groupId) }
      });

      if (!group) {
        throw new NotFoundException(`Group with ID ${createContributionDto.groupId} not found`);
      }

      // Handle BUDGET contributions
      if (createContributionDto.contributionType === ContributionType.BUDGET) {
        const budget = await prisma.familyBudgets.findUnique({
          where: { id: BigInt(createContributionDto.targetId) }
        });

        if (!budget) {
          throw new NotFoundException(`Budget with ID ${createContributionDto.targetId} not found`);
        }

        const contributionData = await prisma.familyTransactionContributions.create({
          data: {
            transactionId: BigInt(createContributionDto.transactionId),
            groupId: BigInt(createContributionDto.groupId),
            amount: createContributionDto.amount,
            contributionType: createContributionDto.contributionType,
            targetId: BigInt(createContributionDto.targetId),
            budgetId: BigInt(createContributionDto.targetId),
            created_at: new Date(),
            userId: createContributionDto.userId || userId
          },
          include: {
            transaction: {
              include: {
                category: true
              }
            },
            group: true,
          }
        });

        return FamilyTransactionContribution.fromPrisma(contributionData);
      }
      // Handle GOAL contributions
      else if (createContributionDto.contributionType === ContributionType.GOAL) {
        const goal = await prisma.familyGoals.findUnique({
          where: { id: BigInt(createContributionDto.targetId) }
        });

        if (!goal) {
          throw new NotFoundException(`Goal with ID ${createContributionDto.targetId} not found`);
        }

        const contributionData = await prisma.familyTransactionContributions.create({
          data: {
            transactionId: BigInt(createContributionDto.transactionId),
            groupId: BigInt(createContributionDto.groupId),
            amount: createContributionDto.amount,
            contributionType: createContributionDto.contributionType,
            targetId: BigInt(createContributionDto.targetId),
            goalId: BigInt(createContributionDto.targetId),
            created_at: new Date(),
            userId: createContributionDto.userId || userId
          },
          include: {
            transaction: {
              include: {
                category: true
              }
            },
            group: true,
          }
        });

        return FamilyTransactionContribution.fromPrisma(contributionData);
      }

      throw new BadRequestException('Invalid contribution type');
    });
  }

  async findAll(groupId: string, options?: { page?: number, limit?: number, includeDetails?: boolean }): Promise<{ data: FamilyTransactionContribution[], total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    // Split into two queries for better performance
    const [contributions, total] = await Promise.all([
      this.prisma.familyTransactionContributions.findMany({
        where: { groupId: BigInt(groupId) },
        include: {
          transaction: {
            include: {
              // Only include essential user fields
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          // Don't include full group data, just necessary fields
          group: {
            select: {
              id: true,
              name: true
            }
          },
          familyBudget: options?.includeDetails ? {
            include: {
              category: true
            }
          } : {
            select: {
              id: true,
              categoryId: true
            }
          },
          familyGoal: options?.includeDetails ? true : {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.familyTransactionContributions.count({
        where: { groupId: BigInt(groupId) }
      })
    ]);

    return {
      data: FamilyTransactionContribution.fromPrismaArray(contributions),
      total
    };
  }

  async findOne(id: string): Promise<FamilyTransactionContribution | null> {
    const contribution = await this.prisma.familyTransactionContributions.findUnique({
      where: { id: BigInt(id) },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        group: true,
        familyBudget: {
          include: {
            category: true
          }
        },
        familyGoal: true
      }
    });

    if (!contribution) {
      return null;
    }

    return FamilyTransactionContribution.fromPrisma(contribution);
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
        transaction: true,
        group: true,
        familyBudget: {
          include: {
            category: true
          }
        },
        familyGoal: true
      },
      orderBy: { created_at: 'desc' }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async findByTransaction(transactionId: string, userId: string): Promise<FamilyTransactionContribution[]> {
    // First verify the transaction belongs to the user
    const transaction = await this.prisma.transactions.findUnique({
      where: { id: BigInt(transactionId) }
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('You can only view contributions for your own transactions');
    }

    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { transactionId: BigInt(transactionId) },
      include: {
        transaction: true,
        group: true,
        familyBudget: {
          include: {
            category: true
          }
        },
        familyGoal: true
      }
    });

    return FamilyTransactionContribution.fromPrismaArray(contributions);
  }

  async remove(id: string): Promise<void> {
    const contribution = await this.prisma.familyTransactionContributions.findUnique({
      where: { id: BigInt(id) }
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Revert the contribution based on type
      if (contribution.contributionType === ContributionType.BUDGET && contribution.budgetId) {
        // Decrease budget spent amount
        await prisma.familyBudgets.update({
          where: { id: contribution.budgetId },
          data: {
            spent_amount: {
              decrement: Number(contribution.amount)
            }
          }
        });
      } 
      else if (contribution.contributionType === ContributionType.GOAL && contribution.goalId) {
        // Get the current goal
        const goal = await prisma.familyGoals.findUnique({
          where: { id: contribution.goalId }
        });
        
        if (goal) {
          // Calculate new saved amount
          const newSavedAmount = Number(goal.saved_amount) - Number(contribution.amount);
          let newStatus = goal.status;
          
          // Update status if needed
          if (newSavedAmount <= 0) {
            newStatus = 'PENDING';
          } else if (newSavedAmount < Number(goal.target_amount) && goal.status === 'COMPLETED') {
            newStatus = 'IN_PROGRESS';
          }
          
          // Update goal
          await prisma.familyGoals.update({
            where: { id: contribution.goalId },
            data: {
              saved_amount: newSavedAmount,
              status: newStatus
            }
          });
        }
      }

      // Delete the contribution
      await prisma.familyTransactionContributions.delete({
        where: { id: contribution.id }
      });
    });
  }

  async getGroupContributionStats(groupId: string): Promise<any> {
    // Get all contributions for this group
    const contributions = await this.prisma.familyTransactionContributions.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        transaction: {
          include: {
            user: true
          }
        },
        familyBudget: {
          include: {
            category: true
          }
        },
        familyGoal: true
      }
    });

    // Calculate contribution counts and totals by user
    const userContributions: Record<string, UserContribution> = {};
    let totalContributions = 0;
    let totalBudgetContributions = 0;
    let totalGoalContributions = 0;
    
    contributions.forEach(contribution => {
      const userId = contribution.transaction.userId;
      const userName = contribution.transaction.user.name;
      const amount = Number(contribution.amount);
      
      // Add to user's total
      if (!userContributions[userId]) {
        userContributions[userId] = {
          userId,
          userName,
          total: 0,
          budgetContributions: 0,
          goalContributions: 0,
          count: 0
        };
      }
      
      userContributions[userId].total += amount;
      userContributions[userId].count++;
      
      // Add to type-specific totals
      if (contribution.contributionType === ContributionType.BUDGET) {
        userContributions[userId].budgetContributions += amount;
        totalBudgetContributions += amount;
      } else {
        userContributions[userId].goalContributions += amount;
        totalGoalContributions += amount;
      }
      
      totalContributions += amount;
    });

    return {
      groupId: String(groupId),
      totalContributions,
      totalBudgetContributions,
      totalGoalContributions,
      contributionCount: contributions.length,
      userContributions: Object.values(userContributions)
        .sort((a: UserContribution, b: UserContribution) => b.total - a.total) // Sort by highest contribution
    };
  }
}
