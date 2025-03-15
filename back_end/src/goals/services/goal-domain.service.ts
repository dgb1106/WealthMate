import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaGoalRepository } from '../repositories/prisma-goal.repository';
import { Goal } from '../entities/goal.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoalDomainService {
  constructor(
    private readonly goalRepository: PrismaGoalRepository,
    private readonly prisma: PrismaService
  ) {}

  async addFunds(id: string, userId: string, amount: number): Promise<Goal> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Verify user has enough balance
    const user = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const currentBalance = Number(user.current_balance || 0);
    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance to add to goal');
    }

    // Start a transaction to update both goal and user balance
    return this.prisma.$transaction(async (prisma) => {
      // Add funds to goal
      const goal = await this.goalRepository.addFundsToGoal(id, userId, amount);
      
      // Update user balance
      await prisma.users.update({
        where: { id: userId },
        data: { current_balance: { decrement: amount } }
      });

      return goal;
    });
  }

  async updateSavedAmount(id: string, userId: string, amount: number): Promise<Goal> {
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }
    
    return this.goalRepository.updateSavedAmount(id, userId, amount);
  }
  
  async transferFundsBetweenGoals(
    sourceGoalId: string, 
    targetGoalId: string, 
    userId: string, 
    amount: number
  ): Promise<{ sourceGoal: Goal; targetGoal: Goal }> {
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than 0');
    }

    // Validate both goals exist and belong to the user
    const sourceGoal = await this.goalRepository.findOne(sourceGoalId, userId);
    const targetGoal = await this.goalRepository.findOne(targetGoalId, userId);

    if (!sourceGoal || !targetGoal) {
      throw new NotFoundException('One or both goals not found');
    }

    if (sourceGoal.saved_amount < amount) {
      throw new BadRequestException('Source goal has insufficient funds');
    }

    // Execute the transfer in a transaction
    return this.prisma.$transaction(async () => {
      // Reduce amount from source goal
      const updatedSourceGoal = await this.goalRepository.updateSavedAmount(
        sourceGoalId, 
        userId, 
        sourceGoal.saved_amount - amount
      );
      
      // Add amount to target goal
      const updatedTargetGoal = await this.goalRepository.addFundsToGoal(
        targetGoalId,
        userId,
        amount
      );

      return { 
        sourceGoal: updatedSourceGoal, 
        targetGoal: updatedTargetGoal 
      };
    });
  }
  
  async getGoalStatistics(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    overdueGoals: number;
    totalSaved: number;
    totalTarget: number;
    overallProgress: number;
  }> {
    const [allGoals, completedGoals, activeGoals, overdueGoals] = await Promise.all([
      this.goalRepository.findAll(userId),
      this.goalRepository.findCompletedGoals(userId),
      this.goalRepository.findActiveGoals(userId),
      this.goalRepository.findOverdueGoals(userId),
    ]);
    
    const totalSaved = allGoals.reduce((sum, goal) => sum + goal.saved_amount, 0);
    const totalTarget = allGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
    
    return {
      totalGoals: allGoals.length,
      completedGoals: completedGoals.length,
      activeGoals: activeGoals.length,
      overdueGoals: overdueGoals.length,
      totalSaved: Math.round(totalSaved * 100) / 100,
      totalTarget: Math.round(totalTarget * 100) / 100,
      overallProgress: totalTarget > 0 
        ? Math.round((totalSaved / totalTarget) * 1000) / 10 
        : 0
    };
  }
  
  async getGoalRecommendations(userId: string): Promise<{
    needsAttention: Goal[];
    nearingCompletion: Goal[];
    recommendedSavings: { goal: Goal; recommendedAmount: number }[];
  }> {
    const [overdueGoals, nearingDeadlineGoals, allActiveGoals] = await Promise.all([
      this.goalRepository.findOverdueGoals(userId),
      this.goalRepository.findGoalsNearingDeadline(userId, 30),
      this.goalRepository.findActiveGoals(userId)
    ]);
    
    // Find goals nearing completion (80%+ complete)
    const nearingCompletion = allActiveGoals
      .filter(goal => {
        const percentComplete = (goal.saved_amount / goal.target_amount) * 100;
        return percentComplete >= 80 && percentComplete < 100;
      })
      .sort((a, b) => 
        (b.saved_amount / b.target_amount) - (a.saved_amount / a.target_amount)
      );
    
    // Create recommended savings based on remaining amount and priority
    const recommendedSavings = allActiveGoals
      .filter(goal => goal.saved_amount < goal.target_amount)
      .map(goal => ({
        goal,
        recommendedAmount: Math.min(
          goal.getMonthlyPaymentNeeded(),
          goal.getRemainingAmount()
        )
      }))
      .sort((a, b) => {
        // Sort by days remaining (ascending)
        return a.goal.getDaysRemaining() - b.goal.getDaysRemaining();
      });
    
    return {
      needsAttention: [...overdueGoals, ...nearingDeadlineGoals],
      nearingCompletion,
      recommendedSavings: recommendedSavings.slice(0, 3) // Top 3 recommendations
    };
  }
}
