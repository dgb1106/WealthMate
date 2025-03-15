import { Injectable, BadRequestException } from '@nestjs/common';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { DateUtilsService } from '../../common/services/date-utils.service';

@Injectable()
export class BudgetDomainService {
  constructor(private readonly dateUtils: DateUtilsService) {}

  /**
   * Validates a new budget creation data
   * @param createBudgetDto Budget creation data
   * @throws BadRequestException if validation fails
   */
  validateCreateBudgetDto(createBudgetDto: CreateBudgetDto): void {
    // Validate amount constraints
    if (createBudgetDto.limit_amount <= 0) {
      throw new BadRequestException('Budget limit amount must be greater than zero');
    }
    
    if (createBudgetDto.spent_amount < 0) {
      throw new BadRequestException('Budget spent amount cannot be negative');
    }

    // Validate date range
    const startDate = new Date(createBudgetDto.start_date);
    const endDate = new Date(createBudgetDto.end_date);
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  /**
   * Validates budget update data
   * @param updateBudgetDto Budget update data
   * @param existingBudget Existing budget
   * @throws BadRequestException if validation fails
   */
  validateUpdateBudgetDto(updateBudgetDto: UpdateBudgetDto, existingBudget: Budget): void {
    // Validate amount constraints if provided
    if (updateBudgetDto.limit_amount !== undefined && updateBudgetDto.limit_amount <= 0) {
      throw new BadRequestException('Budget limit amount must be greater than zero');
    }
    
    if (updateBudgetDto.spent_amount !== undefined && updateBudgetDto.spent_amount < 0) {
      throw new BadRequestException('Budget spent amount cannot be negative');
    }
    
    // Validate dates if both provided
    if (updateBudgetDto.start_date && updateBudgetDto.end_date) {
      const startDate = new Date(updateBudgetDto.start_date);
      const endDate = new Date(updateBudgetDto.end_date);
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    // Or if only one date is provided, check against existing date
    else if (updateBudgetDto.start_date) {
      const startDate = new Date(updateBudgetDto.start_date);
      
      if (startDate > existingBudget.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    else if (updateBudgetDto.end_date) {
      const endDate = new Date(updateBudgetDto.end_date);
      
      if (existingBudget.start_date > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
  }

  /**
   * Calculates budget progress statistics
   * @param budget The budget to analyze
   * @returns Budget statistics
   */
  calculateBudgetStatistics(budget: Budget): any {
    const today = new Date();
    
    return {
      percentageUsed: budget.getPercentageUsed(),
      status: budget.getStatus(),
      remainingAmount: budget.getRemainingAmount(),
      remainingPercentage: budget.getRemainingPercentage(),
      isActive: budget.isActive(today),
      isOverBudget: budget.isOverLimit(),
      daysElapsed: budget.getDaysElapsed(today),
      daysTotal: budget.getBudgetDurationInDays(),
      daysRemaining: budget.isActive(today) 
        ? Math.max(0, this.dateUtils.getDaysBetweenDates(today, budget.end_date))
        : 0,
      dailyBudgetAmount: budget.getDailyBudgetAmount(),
      isOnTrack: budget.isSpendingOnTrack(today)
    };
  }

  /**
   * Lọc danh sách ngân sách cho tháng hiện tại
   * @param budgets Danh sách ngân sách cần lọc
   * @returns Danh sách ngân sách trong tháng hiện tại
   */
  filterBudgetsForCurrentMonth(budgets: Budget[]): Budget[] {
    const { firstDay, lastDay } = this.dateUtils.getCurrentMonthRange();
    
    return budgets.filter(budget => 
      this.dateUtils.doDateRangesOverlap(
        budget.start_date, budget.end_date,
        firstDay, lastDay
      )
    );
  }
  
  /**
   * Tính toán tỷ lệ chi tiêu trung bình hàng ngày theo ngân sách
   * @param budget Ngân sách cần tính
   * @returns Số tiền chi tiêu trung bình mỗi ngày
   */
  calculateDailyAverageSpend(budget: Budget): number {
    const today = new Date();
    if (!budget.isActive(today)) return 0;
    
    const daysElapsed = budget.getDaysElapsed(today);
    if (daysElapsed <= 0) return 0;
    
    return budget.spent_amount / daysElapsed;
  }
  
  /**
   * Dự đoán chi tiêu cuối kỳ dựa trên tốc độ chi tiêu hiện tại
   * @param budget Ngân sách cần dự đoán
   * @returns Số tiền dự đoán sẽ chi tiêu cuối kỳ
   */
  predictEndOfPeriodSpending(budget: Budget): number {
    const today = new Date();
    if (!budget.isActive(today)) return budget.spent_amount;
    
    const dailyAverage = this.calculateDailyAverageSpend(budget);
    const daysRemaining = this.dateUtils.getDaysBetweenDates(today, budget.end_date);
    
    return budget.spent_amount + (dailyAverage * daysRemaining);
  }
  
  /**
   * Nhóm các ngân sách theo trạng thái
   * @param budgets Danh sách ngân sách
   * @returns Các ngân sách được nhóm theo trạng thái
   */
  groupBudgetsByStatus(budgets: Budget[]): Record<string, Budget[]> {
    return budgets.reduce((groups, budget) => {
      const status = budget.getStatus();
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(budget);
      return groups;
    }, {} as Record<string, Budget[]>);
  }
}
