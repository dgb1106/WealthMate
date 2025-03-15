import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loans.dto';
import { UpdateLoanDto } from './dto/update-loans.dto';
import { PayLoanDto } from './dto/pay-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khoản nợ mới' })
  @ApiResponse({ status: 201, description: 'Khoản nợ đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  createLoan(@Request() req, @Body() createLoanDto: CreateLoanDto) {
    return this.loansService.createLoan(req.user.userId, createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả khoản nợ của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khoản nợ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  getLoans(@Request() req) {
    return this.loansService.getLoans(req.user.userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy các khoản nợ đang hoạt động của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khoản nợ đang hoạt động thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  getActiveLoans(@Request() req) {
    return this.loansService.getActiveLoans(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy các khoản nợ sắp đến hạn' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khoản nợ sắp đến hạn thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiQuery({ name: 'days', required: false, description: 'Số ngày tới (mặc định là 30 ngày)' })
  getUpcomingDueLoans(@Request() req, @Query('days') days: number = 30) {
    return this.loansService.getUpcomingDueLoans(req.user.userId, Number(days));
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Lấy các khoản nợ quá hạn' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khoản nợ quá hạn thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  getOverdueLoans(@Request() req) {
    return this.loansService.getOverdueLoans(req.user.userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Lấy tóm tắt về khoản nợ của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy tóm tắt khoản nợ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  getLoanSummary(@Request() req) {
    return this.loansService.getLoanSummary(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một khoản nợ' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin chi tiết khoản nợ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoản nợ.' })
  @ApiParam({ name: 'id', description: 'ID của khoản nợ' })
  getLoanById(@Request() req, @Param('id') id: string) {
    return this.loansService.getLoanById(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khoản nợ' })
  @ApiResponse({ status: 200, description: 'Cập nhật khoản nợ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoản nợ.' })
  @ApiParam({ name: 'id', description: 'ID của khoản nợ' })
  updateLoan(@Request() req, @Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.updateLoan(req.user.userId, id, updateLoanDto);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Thanh toán khoản vay' })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc số dư không đủ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoản vay' })
  @ApiParam({ name: 'id', description: 'ID khoản vay' })
  makePayment(@Request() req, @Param('id') id: string, @Body() payLoanDto: PayLoanDto) {
    return this.loansService.makePayment(req.user.userId, id, payLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khoản nợ' })
  @ApiResponse({ status: 200, description: 'Xóa khoản nợ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khoản nợ.' })
  @ApiParam({ name: 'id', description: 'ID của khoản nợ' })
  deleteLoan(@Request() req, @Param('id') id: string) {
    return this.loansService.deleteLoan(req.user.userId, id);
  }

  @Get(':id/repayment-plan')
  @ApiOperation({ summary: 'Lấy kế hoạch trả nợ cho một khoản vay' })
  @ApiResponse({ status: 200, description: 'Kế hoạch trả nợ được tạo thành công.' })
  @ApiResponse({ status: 404, description: 'Khoản vay không tìm thấy.' })
  @ApiParam({ name: 'id', description: 'ID của khoản vay' })
  getRepaymentPlan(@Request() req, @Param('id') id: string) {
    return this.loansService.getRepaymentPlan(req.user.userId, id);
  }

  @Get('analysis/portfolio')
  @ApiOperation({ summary: 'Phân tích danh mục khoản vay' })
  @ApiResponse({ status: 200, description: 'Phân tích danh mục khoản vay thành công.' })
  analyzeLoanPortfolio(@Request() req) {
    return this.loansService.analyzeLoanPortfolio(req.user.userId);
  }

  @Get(':id/prepayment-savings')
  @ApiOperation({ summary: 'Tính toán tiết kiệm khi trả trước' })
  @ApiResponse({ status: 200, description: 'Tính toán tiết kiệm thành công.' })
  @ApiResponse({ status: 404, description: 'Khoản vay không tìm thấy.' })
  @ApiParam({ name: 'id', description: 'ID của khoản vay' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Số tiền trả trước' })
  calculatePrepaymentSavings(
    @Request() req,
    @Param('id') id: string,
    @Query('amount') amount: number
  ) {
    return this.loansService.calculatePrepaymentSavings(req.user.userId, id, Number(amount));
  }
}
