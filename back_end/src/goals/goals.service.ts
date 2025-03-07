import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalStatus } from '../common/enums/enum';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalDto) {
    try {
      // Kiểm tra thời gian hợp lệ
      const dueDate = new Date(createGoalDto.due_date);
      const today = new Date();
      
      if (dueDate <= today) {
        throw new BadRequestException('Ngày hoàn thành mục tiêu phải là ngày trong tương lai');
      }

      // Tạo mục tiêu mới
      const goal = await this.prisma.goals.create({
        data: {
          userId,
          name: createGoalDto.name,
          target_amount: createGoalDto.target_amount,
          saved_amount: createGoalDto.saved_amount || 0,
          status: GoalStatus.PENDING,
          due_date: dueDate,
          created_at: new Date()
        }
      });

      return {
        ...goal,
        id: String(goal.id)
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo mục tiêu: ' + error.message);
    }
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goals.findMany({
      where: { userId }
    });

    return goals.map(goal => ({
      ...goal,
      id: String(goal.id)
    }));
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goals.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!goal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }

    return {
      ...goal,
      id: String(goal.id)
    };
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    // Kiểm tra goal tồn tại
    const existingGoal = await this.prisma.goals.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!existingGoal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }

    // Kiểm tra thời gian hợp lệ nếu due_date được cung cấp
    if (updateGoalDto.due_date) {
      const dueDate = new Date(updateGoalDto.due_date);
      const today = new Date();
      
      if (dueDate <= today) {
        throw new BadRequestException('Ngày hoàn thành mục tiêu phải là ngày trong tương lai');
      }
    }

    // Kiểm tra và cập nhật trạng thái
    let status = updateGoalDto.status;
    if (updateGoalDto.saved_amount !== undefined) {
      if (updateGoalDto.saved_amount >= existingGoal.target_amount.toNumber()) {
        status = GoalStatus.COMPLETED;
      } else if (updateGoalDto.saved_amount > 0) {
        status = GoalStatus.IN_PROGRESS;
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {};

    if (updateGoalDto.name !== undefined) {
      updateData.name = updateGoalDto.name;
    }
    if (updateGoalDto.target_amount !== undefined) {
      updateData.target_amount = updateGoalDto.target_amount;
    }
    if (updateGoalDto.saved_amount !== undefined) {
      updateData.saved_amount = updateGoalDto.saved_amount;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (updateGoalDto.due_date !== undefined) {
      updateData.due_date = new Date(updateGoalDto.due_date);
    }

    // Cập nhật mục tiêu
    const updatedGoal = await this.prisma.goals.update({
      where: {
        id: BigInt(id)
      },
      data: updateData
    });

    return {
      ...updatedGoal,
      id: String(updatedGoal.id)
    };
  }

  async remove(id: string, userId: string) {
    // Kiểm tra goal tồn tại
    const existingGoal = await this.prisma.goals.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!existingGoal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }

    // Xóa mục tiêu
    await this.prisma.goals.delete({
      where: {
        id: BigInt(id)
      }
    });

    return { success: true, message: 'Đã xóa mục tiêu thành công' };
  }

  async updateSavedAmount(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goals.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!goal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }

    let status = goal.status;
    if (amount >= goal.target_amount.toNumber()) {
      status = GoalStatus.COMPLETED;
    } else if (amount > 0) {
      status = GoalStatus.IN_PROGRESS;
    } else {
      status = GoalStatus.PENDING;
    }

    const updatedGoal = await this.prisma.goals.update({
      where: {
        id: BigInt(id)
      },
      data: {
        saved_amount: amount,
        status
      }
    });

    return {
      ...updatedGoal,
      id: String(updatedGoal.id)
    };
  }

  async addFundsToGoal(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goals.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!goal) {
      throw new NotFoundException(`Không tìm thấy mục tiêu với ID ${id}`);
    }

    const user = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user || user.current_balance.toNumber() < amount) {
      throw new BadRequestException('Số dư hiện tại không đủ để thêm vào mục tiêu');
    }

    const newSavedAmount = goal.saved_amount.toNumber() + amount;
    let status = goal.status;
    if (newSavedAmount >= goal.target_amount.toNumber()) {
      status = GoalStatus.COMPLETED;
    } else if (newSavedAmount > 0) {
      status = GoalStatus.IN_PROGRESS;
    } else {
      status = GoalStatus.PENDING;
    }

    const updatedGoal = await this.prisma.goals.update({
      where: {
        id: BigInt(id)
      },
      data: {
        saved_amount: newSavedAmount,
        status
      }
    });

    // Trừ số tiền từ số dư hiện tại của người dùng
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        current_balance: user.current_balance.toNumber() - amount
      }
    });

    return {
      ...updatedGoal,
      id: String(updatedGoal.id)
    };
  }
}
