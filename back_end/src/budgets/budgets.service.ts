import { Inject, Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetRepository } from './repositories/budget-repository.interface';
import { BudgetDomainService } from './services/budget-domain.service';

@Injectable()
export class BudgetsService {
  constructor(
    @Inject('BudgetRepository')
    private readonly budgetRepository: BudgetRepository,
    private readonly budgetDomainService: BudgetDomainService
  ) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    // Validate the input using the domain service
    this.budgetDomainService.validateCreateBudgetDto(createBudgetDto);
    
    // Create the budget using the repository
    const budget = await this.budgetRepository.create(userId, createBudgetDto);
    budget.spent_amount = 0;
    // Return the formatted budget
    return budget.toResponseFormat();
  }

  async findAll(userId: string) {
    // Get all budgets for the user
    const budgets = await this.budgetRepository.findAll(userId);
    
    // Format them for API response
    return budgets.map(budget => budget.toResponseFormat());
  }

  async findOne(id: string, userId: string) {
    // Get the specific budget
    const budget = await this.budgetRepository.findOne(id, userId);
    
    // Calculate budget statistics
    const statistics = this.budgetDomainService.calculateBudgetStatistics(budget);
    
    // Return the formatted budget with enhanced statistics
    return {
      ...budget.toResponseFormat(),
      ...statistics
    };
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    // Get the existing budget
    const existingBudget = await this.budgetRepository.findOne(id, userId);
    
    // Validate the update using the domain service
    this.budgetDomainService.validateUpdateBudgetDto(updateBudgetDto, existingBudget);
    
    // Update the budget
    const updatedBudget = await this.budgetRepository.update(id, userId, updateBudgetDto);
    
    // Return the formatted updated budget
    return updatedBudget.toResponseFormat();
  }

  async remove(id: string, userId: string) {
    // Delete the budget
    await this.budgetRepository.remove(id, userId);
    
    // Return success message
    return { success: true, message: 'Budget deleted successfully' };
  }

  async findByCategory(userId: string, categoryId: string) {
    // Find budgets by category
    const budgets = await this.budgetRepository.findByCategory(userId, categoryId);
    
    // Format them for API response
    return budgets.map(budget => budget.toResponseFormat());
  }

  async getCurrentBudgets(userId: string) {
    // Get current active budgets
    const budgets = await this.budgetRepository.getCurrentBudgets(userId);
    
    // Format them for API response with additional status information
    return budgets.map(budget => ({
      ...budget.toResponseFormat(),
      isOnTrack: budget.isSpendingOnTrack(),
      daysRemaining: this.budgetDomainService.calculateBudgetStatistics(budget).daysRemaining
    }));
  }

  async updateSpentAmount(id: string, userId: string, amount: number) {
    // Update the spent amount
    const budget = await this.budgetRepository.updateSpentAmount(id, userId, amount);
    
    // Get the formatted response with statistics
    const response = budget.toResponseFormat();
    
    // Add additional information about budget status after update
    return {
      ...response,
      isOverLimit: budget.isOverLimit(),
      status: budget.getStatus()
    };
  }

  async increaseSpentAmount(id: string, userId: string, amount: number) {
    // Increase the spent amount
    const budget = await this.budgetRepository.incrementSpentAmount(id, userId, amount);

    // Get the formatted response with statistics
    const response = budget.toResponseFormat();

    return {
      ...response,
      isOverLimit: budget.isOverLimit(),
      status: budget.getStatus()
    }
  }

  async updateBudgetSpentAmount(
    userId: string, 
    categoryId: string, 
    amount: number,
    transactionDate: Date
  ): Promise<void> {
    // Tìm tất cả budgets phù hợp với điều kiện
    const matchingBudgets = await this.budgetRepository.findMatchingBudgets(
      userId, 
      categoryId,
      transactionDate
    );
    
    // Cập nhật spent_amount cho mỗi budget tìm thấy
    for (const budget of matchingBudgets) {
      await this.budgetRepository.incrementSpentAmount(budget.id, userId, amount);
    }
  }

  async getCurrentMonthBudgets(userId: string) {
    // Get budgets for the current month
    const budgets = await this.budgetRepository.getCurrentMonthBudgets(userId);
    
    // Group budgets by status for better analysis
    const groupedBudgets = this.budgetDomainService.groupBudgetsByStatus(budgets);
    
    // Calculate overall statistics
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0);
    const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);
    
    // Format individual budgets for response
    const formattedBudgets = budgets.map(budget => budget.toResponseFormat());
    
    // Return enhanced budget data with summaries
    return {
      budgets: formattedBudgets,
      summary: {
        totalBudgets: budgets.length,
        totalSpent,
        totalLimit,
        overallPercentage: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
        budgetsByStatus: Object.keys(groupedBudgets).map(status => ({
          status,
          count: groupedBudgets[status].length
        }))
      }
    };
  }
}
