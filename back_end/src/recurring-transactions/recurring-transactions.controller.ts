import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RecurringTransactionService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Frequency } from '../common/enums/enum';

@ApiTags('recurring-transactions')
@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecurringTransactionController {
  constructor(private readonly recurringTxService: RecurringTransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch định kỳ mới' })
  @ApiResponse({ status: 201, description: 'Giao dịch định kỳ được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateRecurringTransactionDto
  ) {
    return this.recurringTxService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả giao dịch định kỳ của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch định kỳ' })
  async findAll(@Request() req: RequestWithUser) {
    return this.recurringTxService.findAll(req.user.userId);
  }

  @Get('frequency/:frequency')
  @ApiOperation({ summary: 'Lấy giao dịch định kỳ theo tần suất' })
  @ApiParam({ name: 'frequency', enum: Frequency, description: 'Loại tần suất' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch định kỳ theo tần suất chỉ định' })
  async findByFrequency(
    @Request() req: RequestWithUser,
    @Param('frequency') frequency: Frequency
  ) {
    return this.recurringTxService.findByFrequency(req.user.userId, frequency);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy giao dịch định kỳ theo danh mục' })
  @ApiParam({ name: 'categoryId', type: String, description: 'ID danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch định kỳ theo danh mục' })
  async findByCategory(
    @Request() req: RequestWithUser,
    @Param('categoryId') categoryId: string
  ) {
    return this.recurringTxService.findByCategory(req.user.userId, categoryId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy các giao dịch định kỳ sắp tới' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Số ngày xem trước' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch định kỳ sắp tới' })
  async getUpcoming(
    @Request() req: RequestWithUser,
    @Query('days') days?: number
  ) {
    return this.recurringTxService.getUpcomingTransactions(req.user.userId, days);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Xử lý giao dịch định kỳ ngay lập tức' })
  @ApiParam({ name: 'id', type: String, description: 'ID giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Giao dịch đã được xử lý thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ' })
  async processTransaction(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.processTransaction(id, req.user.userId);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Bỏ qua lần xuất hiện tiếp theo của giao dịch định kỳ' })
  @ApiParam({ name: 'id', type: String, description: 'ID giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Đã bỏ qua lần xuất hiện tiếp theo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ' })
  async skipNextOccurrence(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.skipNextOccurrence(id, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin giao dịch định kỳ theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch định kỳ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ' })
  async findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật giao dịch định kỳ' })
  @ApiParam({ name: 'id', type: String, description: 'ID giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Giao dịch định kỳ được cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ' })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateRecurringTransactionDto
  ) {
    return this.recurringTxService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch định kỳ' })
  @ApiParam({ name: 'id', type: String, description: 'ID giao dịch định kỳ' })
  @ApiResponse({ status: 200, description: 'Giao dịch định kỳ đã được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch định kỳ' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.remove(id, req.user.userId);
  }

  @Post('process-due')
  @ApiOperation({ summary: 'Xử lý tất cả giao dịch định kỳ đến hạn' })
  @ApiResponse({ status: 200, description: 'Các giao dịch định kỳ đến hạn đã được xử lý thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập' })
  @HttpCode(HttpStatus.OK)
  async processDueTransactions() { // Bỏ tham số req không sử dụng
    // Có thể thêm kiểm tra admin ở đây nếu cần
    return this.recurringTxService.processDueTransactions();
  }
}
