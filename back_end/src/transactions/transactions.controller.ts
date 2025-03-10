import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get, 
  Param, 
  Query,
  ParseIntPipe,
  BadRequestException,
  Patch,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiResponse({ status: 201, description: 'Giao dịch đã được tạo thành công.' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tìm thấy.' })
  @ApiBody({ type: CreateTransactionDto })
  async createTransaction(
    @Request() req,
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    return this.transactionsService.createTransaction(req.user.userId, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả giao dịch của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch.' })
  async findAllTransactions(@Request() req) {
    return this.transactionsService.getAllTransactions(req.user.userId);
  }

  @Get('current-month')
  @ApiOperation({ summary: 'Lấy giao dịch của tháng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch trong tháng.' })
  async getCurrentMonthTransactions(@Request() req) {
    return this.transactionsService.getCurrentMonthTransactions(req.user.userId);
  }

  @Get('month')
  @ApiOperation({ summary: 'Lấy giao dịch theo tháng và năm cụ thể' })
  @ApiQuery({ name: 'month', type: Number, description: 'Tháng (0-11)' })
  @ApiQuery({ name: 'year', type: Number, description: 'Năm' })
  async getMonthTransactions(
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    if (month < 0 || month > 11) {
      throw new BadRequestException('Tháng phải từ 0-11');
    }
    return this.transactionsService.getTransactionsForMonth(req.user.userId, month, year);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Lấy giao dịch trong khoảng thời gian' })
  @ApiQuery({ name: 'startDate', type: String, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', type: String, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  async getDateRangeTransactions(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.transactionsService.getTransactionsForDateRange(
      req.user.userId, 
      start, 
      end
    );
  }

  @Get('income')
  @ApiOperation({ summary: 'Lấy tất cả giao dịch thu nhập' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch thu nhập.' })
  async getIncomeTransactions(@Request() req) {
    return this.transactionsService.getIncomeTransactions(req.user.userId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Lấy tất cả giao dịch chi tiêu' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch chi tiêu.' })
  async getExpenseTransactions(@Request() req) {
    return this.transactionsService.getExpenseTransactions(req.user.userId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy giao dịch theo danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch theo danh mục.' })
  @ApiParam({ name: 'categoryId', description: 'ID của danh mục' })
  async getCategoryTransactions(
    @Request() req,
    @Param('categoryId') categoryId: string
  ) {
    return this.transactionsService.getTransactionsByCategory(
      req.user.userId, 
      categoryId
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Lấy tổng hợp giao dịch theo danh mục trong khoảng thời gian' })
  @ApiResponse({ status: 200, description: 'Danh sách tổng hợp giao dịch.' })
  @ApiQuery({ name: 'startDate', type: String, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', type: String, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  async getTransactionSummary(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.transactionsService.getTransactionSummaryByCategory(
      req.user.userId, 
      start, 
      end
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một giao dịch' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch' })
  async getTransaction(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.transactionsService.getTransactionById(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giao dịch' })
  @ApiResponse({ status: 200, description: 'Giao dịch đã được cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch' })
  @ApiBody({ type: UpdateTransactionDto })
  async updateTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionsService.updateTransaction(req.user.userId, id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa giao dịch' })
  @ApiResponse({ status: 200, description: 'Giao dịch đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch.' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch' })
  async deleteTransaction(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.transactionsService.deleteTransaction(req.user.userId, id);
  }
}
