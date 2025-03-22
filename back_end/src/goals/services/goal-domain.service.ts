import { Injectable, BadRequestException } from '@nestjs/common';
import { Goal } from '../entities/goal.entity';

@Injectable()
export class GoalDomainService {
  /**
   * Validates funds transfer operation
   * @param sourceGoal Source goal
   * @param targetGoal Target goal 
   * @param amount Amount to transfer
   * @throws BadRequestException if validation fails
   */
  validateFundsTransfer(sourceGoal: Goal, targetGoal: Goal, amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than 0');
    }

    if (!sourceGoal || !targetGoal) {
      throw new BadRequestException('Both source and target goals must exist');
    }

    if (sourceGoal.saved_amount < amount) {
      throw new BadRequestException('Source goal has insufficient funds');
    }
  }
  
  /**
   * Validates adding funds operation
   * @param amount Amount to add
   * @throws BadRequestException if validation fails
   */
  validateAddFunds(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
  }

  /**
   * Validates withdrawing funds operation
   * @param amount Amount to withdraw
   * @throws BadRequestException if validation fails
   */
  validateWithdrawFunds(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
  }
  
  /**
   * Validates updating saved amount
   * @param amount New amount
   * @throws BadRequestException if validation fails
   */
  validateSavedAmount(amount: number): void {
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }
  }

  /**
   * Calculate the progress percentage of a goal
   * @param goal Goal to analyze
   * @returns Progress percentage (0-100)
   */
  calculateProgress(goal: Goal): number {
    if (goal.target_amount <= 0) return 0;
    return Math.min(100, (goal.saved_amount / goal.target_amount) * 100);
  }

  /**
   * Calculate days left to reach goal
   * @param goal Goal to analyze
   * @returns Number of days left
   */
  calculateDaysLeft(goal: Goal): number {
    if (!goal.due_date) return 0;
    
    const today = new Date();
    const dueDate = new Date(goal.due_date);
    const timeDiff = dueDate.getTime() - today.getTime();
    
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }

  /**
   * Calculate monthly payment needed to reach goal on time
   * @param goal Goal to analyze
   * @returns Monthly payment amount
   */
  calculateMonthlyPayment(goal: Goal): number {
    const daysLeft = this.calculateDaysLeft(goal);
    if (daysLeft <= 0) return goal.getRemainingAmount();
    
    const monthsLeft = Math.max(0.1, daysLeft / 30);
    return goal.getRemainingAmount() / monthsLeft;
  }

  /**
   * Process a collection of goals and calculate statistics
   * @param allGoals All goals
   * @param completedGoals Completed goals
   * @param activeGoals Active goals
   * @param overdueGoals Overdue goals
   * @returns Goal statistics
   */
  calculateGoalStatistics(
    allGoals: Goal[], 
    completedGoals: Goal[], 
    activeGoals: Goal[], 
    overdueGoals: Goal[]
  ): {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    overdueGoals: number;
    totalSaved: number;
    totalTarget: number;
    overallProgress: number;
  } {
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

  /**
   * Process goals and generate recommendations
   * @param overdueGoals Overdue goals
   * @param nearingDeadlineGoals Goals nearing deadline
   * @param allActiveGoals All active goals
   * @returns Goal recommendations
   */
  generateGoalRecommendations(
    overdueGoals: Goal[], 
    nearingDeadlineGoals: Goal[], 
    allActiveGoals: Goal[]
  ): {
    needsAttention: Goal[];
    nearingCompletion: Goal[];
    recommendedSavings: { goal: Goal; recommendedAmount: number }[];
  } {
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
