import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaGoalRepository } from './repositories/prisma-goal.repository';
import { GoalDomainService } from './services/goal-domain.service';

@Injectable()
export class GoalsService {
  constructor(
    private readonly goalRepository: PrismaGoalRepository,
    private readonly goalDomainService: GoalDomainService
  ) {}

  async create(userId: string, createGoalDto: CreateGoalDto) {
    try {
      // Kiểm tra thời gian hợp lệ
      const dueDate = new Date(createGoalDto.due_date);
      const today = new Date();
      
      if (dueDate <= today) {
        throw new BadRequestException('Ngày hoàn thành mục tiêu phải là ngày trong tương lai');
      }

      // Sử dụng repository để tạo mục tiêu
      const goal = await this.goalRepository.create(userId, createGoalDto);
      
      // Trả về response format
      return goal.toResponseFormat();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo mục tiêu: ' + error.message);
    }
  }

  async findAll(userId: string) {
    // Lấy tất cả mục tiêu của người dùng thông qua repository
    const goals = await this.goalRepository.findAll(userId);
    
    // Chuyển đổi mỗi mục tiêu sang định dạng phản hồi
    return goals.map(goal => goal.toResponseFormat());
  }

  async findOne(id: string, userId: string) {
    // Tìm mục tiêu cụ thể bằng repository
    const goal = await this.goalRepository.findOne(id, userId);
  
    if (!goal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }
  
    // Trả về mục tiêu với định dạng phản hồi
    return goal.toResponseFormat();
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    // Kiểm tra thời gian hợp lệ nếu due_date được cung cấp
    if (updateGoalDto.due_date) {
      const dueDate = new Date(updateGoalDto.due_date);
      const today = new Date();
      
      if (dueDate <= today) {
        throw new BadRequestException('Ngày hoàn thành mục tiêu phải là ngày trong tương lai');
      }
    }

    // Cập nhật mục tiêu qua repository
    try {
      const goal = await this.goalRepository.update(id, userId, updateGoalDto);
      return goal.toResponseFormat();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật mục tiêu: ' + error.message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Xóa mục tiêu qua repository
      await this.goalRepository.remove(id, userId);
      return { success: true, message: 'Đã xóa mục tiêu thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa mục tiêu: ' + error.message);
    }
  }

  async updateSavedAmount(id: string, userId: string, amount: number) {
    try {
      // Sử dụng domain service để cập nhật số tiền đã tiết kiệm
      const goal = await this.goalRepository.updateSavedAmount(id, userId, amount);
      return goal.toResponseFormat();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật số tiền đã tiết kiệm: ' + error.message);
    }
  }

  async addFundsToGoal(id: string, userId: string, amount: number) {
    try {
      // Validate the amount
      this.goalDomainService.validateAddFunds(amount);
      
      // Use repository to add funds
      const goal = await this.goalRepository.addFundsToGoal(id, userId, amount);
      
      return goal.toResponseFormat();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể thêm tiền vào mục tiêu: ' + error.message);
    }
  }
  
  async getGoalStatistics(userId: string) {
    try {
      // Fetch all the required data from repositories
      const [allGoals, completedGoals, activeGoals, overdueGoals] = await Promise.all([
        this.goalRepository.findAll(userId),
        this.goalRepository.findCompletedGoals(userId),
        this.goalRepository.findActiveGoals(userId),
        this.goalRepository.findOverdueGoals(userId),
      ]);
      
      // Use domain service to calculate statistics
      return this.goalDomainService.calculateGoalStatistics(
        allGoals, 
        completedGoals, 
        activeGoals, 
        overdueGoals
      );
    } catch (error) {
      throw new BadRequestException('Không thể lấy thống kê mục tiêu: ' + error.message);
    }
  }
  
  async getGoalRecommendations(userId: string) {
    try {
      // Fetch all the required data from repositories
      const [overdueGoals, nearingDeadlineGoals, allActiveGoals] = await Promise.all([
        this.goalRepository.findOverdueGoals(userId),
        this.goalRepository.findGoalsNearingDeadline(userId, 30),
        this.goalRepository.findActiveGoals(userId)
      ]);
      
      // Use domain service to generate recommendations
      const recommendations = this.goalDomainService.generateGoalRecommendations(
        overdueGoals, 
        nearingDeadlineGoals, 
        allActiveGoals
      );
      
      // Format the response
      return {
        needsAttention: recommendations.needsAttention.map(goal => goal.toResponseFormat()),
        nearingCompletion: recommendations.nearingCompletion.map(goal => goal.toResponseFormat()),
        recommendedSavings: recommendations.recommendedSavings.map(item => ({
          goal: item.goal.toResponseFormat(),
          recommendedAmount: Math.round(item.recommendedAmount * 100) / 100
        }))
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy đề xuất mục tiêu: ' + error.message);
    }
  }
  
  async transferFundsBetweenGoals(sourceGoalId: string, targetGoalId: string, userId: string, amount: number) {
    try {
      // Get both goals
      const sourceGoal = await this.goalRepository.findOne(sourceGoalId, userId);
      const targetGoal = await this.goalRepository.findOne(targetGoalId, userId);
      
      // Check if both goals exist
      if (!sourceGoal || !targetGoal) {
        throw new NotFoundException('Both source and target goals must exist');
      }
      
      // Validate the transfer
      this.goalDomainService.validateFundsTransfer(sourceGoal, targetGoal, amount);
      
      // Execute the transfer through the repository
      const result = await this.goalRepository.transferFundsBetweenGoals(
        sourceGoalId, 
        targetGoalId, 
        userId, 
        amount
      );
      
      return {
        sourceGoal: result.sourceGoal.toResponseFormat(),
        targetGoal: result.targetGoal.toResponseFormat()
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể chuyển tiền giữa các mục tiêu: ' + error.message);
    }
  }
  
  async findActiveGoals(userId: string) {
    const goals = await this.goalRepository.findActiveGoals(userId);
    return goals.map(goal => goal.toResponseFormat());
  }
  
  async findCompletedGoals(userId: string) {
    const goals = await this.goalRepository.findCompletedGoals(userId);
    return goals.map(goal => goal.toResponseFormat());
  }
  
  async findOverdueGoals(userId: string) {
    const goals = await this.goalRepository.findOverdueGoals(userId);
    return goals.map(goal => goal.toResponseFormat());
  }
  
  async findGoalsNearingDeadline(userId: string, daysThreshold: number = 30) {
    const goals = await this.goalRepository.findGoalsNearingDeadline(userId, daysThreshold);
    return goals.map(goal => goal.toResponseFormat());
  }
}
