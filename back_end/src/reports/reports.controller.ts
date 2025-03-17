import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('income-expense-monthly/ytd')
  @ApiOperation({ summary: 'Báo cáo thu nhập – chi tiêu từ đầu năm đến tháng hiện tại' })
  @ApiResponse({ status: 200, description: 'Báo cáo cho tất cả các tháng kể từ đầu năm đến hiện tại' })
  async getYearToDateIncomeExpenseReport(@Request() req) {
    return this.reportsService.getYearToDateIncomeExpenseReport(req.user.userId);
  }

  @Get('income-expense-monthly/current')
  @ApiOperation({ summary: 'Báo cáo thu nhập – chi tiêu của Tháng hiện tại' })
  @ApiResponse({ status: 200, description: 'Báo cáo chỉ của tháng hiện tại' })
  async getCurrentMonthIncomeExpenseReport(@Request() req) {
    return this.reportsService.getCurrentMonthIncomeExpenseReport(req.user.userId);
  }

  @Get('most-spent-categories-monthly')
  @ApiOperation({ summary: 'Báo cáo các danh mục chi tiêu nhiều nhất hàng tháng' })
  @ApiResponse({ status: 200, description: 'Báo cáo các danh mục chi tiêu nhiều nhất từ tháng đầu năm đến tháng hiện tại' })
  async getMostSpentCategoriesReport(@Request() req) {
    return this.reportsService.getMostSpentCategoriesReport(req.user.userId);
  }

  @Get('most-spent-categories/current')
  @ApiOperation({ summary: 'Báo cáo các danh mục chi tiêu nhiều nhất của Tháng hiện tại' })
  @ApiResponse({ status: 200, description: 'Báo cáo các danh mục chi tiêu nhiều nhất của Tháng hiện tại' })
  async getCurrentMonthMostSpentCategoriesReport(@Request() req) {
    return this.reportsService.getCurrentMonthMostSpentCategoriesReport(req.user.userId);
  }

  @Get('category-analysis')
  @ApiOperation({ summary: 'Báo cáo phân tích theo danh mục: Chi tiêu theo danh mục và Thu nhập theo nguồn' })
  @ApiResponse({ status: 200, description: 'Hiển thị tỷ trọng chi tiêu và thu nhập phân theo danh mục/nguồn' })
  async getCategoryAnalysisReport(@Request() req) {
    // Nếu muốn cho phép truyền tháng, năm thông qua query, có thể lấy từ req.query
    return this.reportsService.getCategoryAnalysisReport(req.user.userId);
  }

  @Get('budget-report')
  @ApiOperation({ summary: 'Báo cáo ngân sách: So sánh ngân sách dự kiến với chi tiêu thực tế theo từng danh mục' })
  @ApiResponse({ status: 200, description: 'Báo cáo ngân sách thành công.' })
  async getBudgetReport(@Request() req) {
    return this.reportsService.getBudgetReport(req.user.userId);
  }

  @Get('loan-report')
  @ApiOperation({ summary: 'Báo cáo khoản vay: Liệt kê khoản vay, số dư, lãi suất, lịch thanh toán' })
  @ApiResponse({ status: 200, description: 'Báo cáo khoản vay thành công.' })
  async getLoanReport(@Request() req) {
    return this.reportsService.getLoanReport(req.user.userId);
  }

  @Get('goals-progress-report')
  @ApiOperation({ summary: 'Báo cáo mục tiêu tài chính: Theo dõi tiến độ các mục tiêu' })
  @ApiResponse({ status: 200, description: 'Báo cáo tiến độ mục tiêu thành công.' })
  async getGoalsProgressReport(@Request() req) {
    return this.reportsService.getGoalsProgressReport(req.user.userId);
  }

  @Get('cash-flow-report')
  @ApiOperation({ summary: 'Báo cáo dòng tiền: Phân tích dòng tiền vào - ra theo thời gian' })
  @ApiResponse({ status: 200, description: 'Báo cáo dòng tiền thành công.' })
  async getCashFlowReport(@Request() req) {
    // Tham số months có thể truyền qua query nếu cần
    return this.reportsService.getCashFlowReport(req.user.userId);
  }

  @Get('trend-analysis-report')
  @ApiOperation({ summary: 'Báo cáo xu hướng tài chính: Tổng hợp xu hướng thu nhập, chi tiêu, tiết kiệm' })
  @ApiResponse({ status: 200, description: 'Báo cáo xu hướng tài chính thành công.' })
  async getTrendAnalysisReport(@Request() req) {
    // Tham số months có thể truyền qua query nếu cần
    return this.reportsService.getTrendAnalysisReport(req.user.userId);
  }
}
