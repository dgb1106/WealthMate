import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo ngân sách mới' })
  @ApiResponse({ status: 201, description: 'Ngân sách đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tìm thấy.' })
  async create(@Request() req, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả ngân sách của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân sách.' })
  async findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Lấy ngân sách hiện tại (trong khoảng thời gian hiện tại)' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân sách hiện tại.' })
  async getCurrentBudgets(@Request() req) {
    return this.budgetsService.getCurrentBudgets(req.user.userId);
  }

  @Get('current-month')
  @ApiOperation({ summary: 'Lấy tất cả ngân sách trong tháng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân sách trong tháng hiện tại.' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  async getCurrentMonthBudgets(@Request() req) {
    return this.budgetsService.getCurrentMonthBudgets(req.user.userId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy ngân sách theo danh mục' })
  @ApiParam({ name: 'categoryId', type: String, description: 'ID của danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân sách theo danh mục.' })
  async findByCategory(@Request() req, @Param('categoryId') categoryId: string) {
    return this.budgetsService.findByCategory(req.user.userId, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một ngân sách' })
  @ApiParam({ name: 'id', type: String, description: 'ID của ngân sách' })
  @ApiResponse({ status: 200, description: 'Chi tiết ngân sách.' })
  @ApiResponse({ status: 404, description: 'Ngân sách không tìm thấy.' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.budgetsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật ngân sách' })
  @ApiParam({ name: 'id', type: String, description: 'ID của ngân sách' })
  @ApiResponse({ status: 200, description: 'Ngân sách đã được cập nhật.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Ngân sách không tìm thấy.' })
  async update(@Request() req, @Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, req.user.userId, updateBudgetDto);
  }

  @Patch(':id/spent-amount')
  @ApiOperation({ summary: 'Cập nhật số tiền đã chi tiêu trong ngân sách' })
  @ApiParam({ name: 'id', type: String, description: 'ID của ngân sách' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Số tiền đã chi tiêu' })
  @ApiResponse({ status: 200, description: 'Số tiền đã chi tiêu đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Ngân sách không tìm thấy.' })
  async updateSpentAmount(
    @Request() req,
    @Param('id') id: string,
    @Query('amount') amount: number
  ) {
    return this.budgetsService.updateSpentAmount(id, req.user.userId, amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngân sách' })
  @ApiParam({ name: 'id', type: String, description: 'ID của ngân sách' })
  @ApiResponse({ status: 200, description: 'Ngân sách đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Ngân sách không tìm thấy.' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.budgetsService.remove(id, req.user.userId);
  }
}
