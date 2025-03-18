import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { FamilyGoalService } from '../services/family-goal.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('family-goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups/:groupId/goals')
export class FamilyGoalController {
  constructor(private readonly familyGoalService: FamilyGoalService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mục tiêu mới cho nhóm gia đình' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiBody({ type: CreateFamilyGoalDto })
  @ApiResponse({ status: 201, description: 'The family goal has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
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
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of family goals.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
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
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of active family goals.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
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
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'Summary of family goals.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  async getGroupGoalsSummary(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGroupGoalsSummary(groupId, userId);
    return { success: true, data: summary };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một mục tiêu cụ thể' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'The family goal.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async findOne(@Param('groupId') groupId: string, @Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.findOne(id, userId);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Lấy tóm tắt chi tiết cho một mục tiêu cụ thể' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Summary of the family goal.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async getGoalSummary(@Param('groupId') groupId: string, @Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGoalSummary(id, userId);
    return { success: true, data: summary };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin mục tiêu' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiBody({ type: UpdateFamilyGoalDto })
  @ApiResponse({ status: 200, description: 'The family goal has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async update(
    @Param('groupId') groupId: string,
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
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'The family goal has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async remove(@Param('groupId') groupId: string, @Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.familyGoalService.remove(id, userId);
    return { success: true, message: 'Goal deleted successfully' };
  }
}
