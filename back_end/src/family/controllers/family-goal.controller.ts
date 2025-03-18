import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { FamilyGoalService } from '../services/family-goal.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('family-goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups/:groupId/goals')
export class FamilyGoalController {
  constructor(private readonly familyGoalService: FamilyGoalService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mục tiêu mới cho nhóm gia đình' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createGoalDto: CreateFamilyGoalDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.create(groupId, userId, createGoalDto);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả mục tiêu của nhóm gia đình' })
  async findAll(@Param('groupId') groupId: string, @Request() req, @Query() paginationDto: PaginationDto) {
    const userId = req.user.id;
    const result = await this.familyGoalService.findAll(groupId, userId, paginationDto);
    return { 
      ...result, 
      data: result.data.map(goal => goal.toResponseFormat()) 
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy tất cả mục tiêu đang hoạt động của nhóm gia đình' })
  async findActive(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    const goals = await this.familyGoalService.findActiveByGroup(groupId, userId);
    return { 
      success: true, 
      data: goals.map(goal => goal.toResponseFormat()) 
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Lấy tóm tắt về mục tiêu của nhóm gia đình' })
  async getGroupGoalsSummary(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGroupGoalsSummary(groupId, userId);
    return { success: true, data: summary };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một mục tiêu cụ thể' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.findOne(id, userId);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Lấy tóm tắt chi tiết cho một mục tiêu cụ thể' })
  async getGoalSummary(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGoalSummary(id, userId);
    return { success: true, data: summary };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin mục tiêu' })
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateFamilyGoalDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.update(id, userId, updateGoalDto);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một mục tiêu' })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.familyGoalService.remove(id, userId);
    return { success: true, message: 'Goal deleted successfully' };
  }
}
