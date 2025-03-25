import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mục tiêu tài chính mới' })
  @ApiResponse({ status: 201, description: 'Mục tiêu đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  async create(@Request() req: RequestWithUser, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(req.user.userId, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả mục tiêu tài chính của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách mục tiêu tài chính.' })
  async findAll(@Request() req: RequestWithUser) {
    return this.goalsService.findAll(req.user.userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy các mục tiêu đang hoạt động' })
  @ApiResponse({ status: 200, description: 'Danh sách mục tiêu đang hoạt động.' })
  async findActiveGoals(@Request() req: RequestWithUser) {
    return this.goalsService.findActiveGoals(req.user.userId);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Lấy các mục tiêu đã hoàn thành' })
  @ApiResponse({ status: 200, description: 'Danh sách mục tiêu đã hoàn thành.' })
  async findCompletedGoals(@Request() req: RequestWithUser) {
    return this.goalsService.findCompletedGoals(req.user.userId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Lấy các mục tiêu quá hạn' })
  @ApiResponse({ status: 200, description: 'Danh sách mục tiêu quá hạn.' })
  async findOverdueGoals(@Request() req: RequestWithUser) {
    return this.goalsService.findOverdueGoals(req.user.userId);
  }

  @Get('nearing-deadline')
  @ApiOperation({ summary: 'Lấy các mục tiêu sắp đến hạn' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Số ngày trước hạn' })
  @ApiResponse({ status: 200, description: 'Danh sách mục tiêu sắp đến hạn.' })
  async findGoalsNearingDeadline(@Request() req: RequestWithUser, @Query('days') days?: number) {
    return this.goalsService.findGoalsNearingDeadline(req.user.userId, days);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Chuyển tiền giữa các mục tiêu' })
  @ApiBody({ type: [String], description: 'sourceGoalId: ID của mục tiêu nguồn, targetGoalId: ID của mục tiêu đích, amount: số tiền cần chuyển' })
  @ApiResponse({ status: 200, description: 'Chuyển tiền thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async transferFunds(
    @Request() req: RequestWithUser,
    @Body() transferData: { sourceGoalId: string; targetGoalId: string; amount: number }
  ) {
    return this.goalsService.transferFundsBetweenGoals(
      transferData.sourceGoalId,
      transferData.targetGoalId,
      req.user.userId,
      transferData.amount
    );
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Rút tiền từ mục tiêu' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Số tiền cần rút' })
  @ApiResponse({ status: 200, description: 'Rút tiền thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async withdrawFunds(
    @Request() req: RequestWithUser, 
    @Param('id') id: string,
    @Query('amount') amount: number
  ) {
    return this.goalsService.withdrawFundsFromGoal(id, req.user.userId, amount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một mục tiêu tài chính' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu tài chính' })
  @ApiResponse({ status: 200, description: 'Chi tiết mục tiêu tài chính.' })
  @ApiResponse({ status: 404, description: 'Mục tiêu tài chính không tìm thấy.' })
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.goalsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật mục tiêu tài chính' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu tài chính' })
  @ApiResponse({ status: 200, description: 'Mục tiêu tài chính đã được cập nhật.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Mục tiêu tài chính không tìm thấy.' })
  async update(@Request() req: RequestWithUser, @Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalsService.update(id, req.user.userId, updateGoalDto);
  }

  @Patch(':id/saved-amount')
  @ApiOperation({ summary: 'Cập nhật số tiền đã tiết kiệm cho mục tiêu' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu tài chính' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Số tiền đã tiết kiệm' })
  @ApiResponse({ status: 200, description: 'Số tiền đã tiết kiệm đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Mục tiêu tài chính không tìm thấy.' })
  async updateSavedAmount(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('amount') amount: number
  ) {
    return this.goalsService.updateSavedAmount(id, req.user.userId, amount);
  }

  @Patch(':id/add-funds')
  @ApiOperation({ summary: 'Thêm tiền vào mục tiêu' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu tài chính' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Số tiền cần thêm' })
  @ApiResponse({ status: 200, description: 'Số tiền đã được thêm vào mục tiêu.' })
  @ApiResponse({ status: 404, description: 'Mục tiêu tài chính không tìm thấy.' })
  async addFundsToGoal(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('amount') amount: number
  ) {
    return this.goalsService.addFundsToGoal(id, req.user.userId, amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mục tiêu tài chính' })
  @ApiParam({ name: 'id', type: String, description: 'ID của mục tiêu tài chính' })
  @ApiResponse({ status: 200, description: 'Mục tiêu tài chính đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Mục tiêu tài chính không tìm thấy.' })
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.goalsService.remove(id, req.user.userId);
  }
}
