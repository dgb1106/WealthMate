import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transactions.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('recurring-transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private readonly recurringTransactionsService: RecurringTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch định kỳ mới' })
  @ApiResponse({ status: 201, description: 'Giao dịch định kỳ đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  create(@Request() req, @Body() createDto: CreateRecurringTransactionDto) {
    return this.recurringTransactionsService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả giao dịch định kỳ của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách giao dịch định kỳ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  findAll(@Request() req) {
    return this.recurringTransactionsService.findAll(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy các giao dịch định kỳ sắp tới' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách giao dịch định kỳ sắp tới thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiQuery({ name: 'days', required: false, description: 'Số ngày tới (mặc định là 7 ngày)' })
  findUpcoming(@Request() req, @Query('days') days: number = 7) {
    return this.recurringTransactionsService.findUpcoming(req.user.userId, Number(days));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin chi tiết giao dịch định kỳ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch định kỳ' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.recurringTransactionsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Cập nhật giao dịch định kỳ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch định kỳ' })
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateRecurringTransactionDto) {
    return this.recurringTransactionsService.update(req.user.userId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Xóa giao dịch định kỳ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch định kỳ' })
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringTransactionsService.remove(req.user.userId, id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Xử lý các giao dịch định kỳ đến hạn' })
  @ApiResponse({ status: 200, description: 'Xử lý giao dịch định kỳ thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  processRecurringTransactions(@Request() req) {
    return this.recurringTransactionsService.processRecurringTransactions(req.user.userId);
  }
}
