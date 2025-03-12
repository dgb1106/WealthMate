import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Create a new recurring transaction' })
  @ApiResponse({ status: 201, description: 'Recurring transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateRecurringTransactionDto
  ) {
    return this.recurringTxService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recurring transactions for a user' })
  @ApiResponse({ status: 200, description: 'List of recurring transactions' })
  async findAll(@Request() req: RequestWithUser) {
    return this.recurringTxService.findAll(req.user.userId);
  }

  @Get('frequency/:frequency')
  @ApiOperation({ summary: 'Get recurring transactions by frequency' })
  @ApiParam({ name: 'frequency', enum: Frequency, description: 'Frequency type' })
  @ApiResponse({ status: 200, description: 'List of recurring transactions with specified frequency' })
  async findByFrequency(
    @Request() req: RequestWithUser,
    @Param('frequency') frequency: Frequency
  ) {
    return this.recurringTxService.findByFrequency(req.user.userId, frequency);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get recurring transactions by category' })
  @ApiParam({ name: 'categoryId', type: String, description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'List of recurring transactions for the category' })
  async findByCategory(
    @Request() req: RequestWithUser,
    @Param('categoryId') categoryId: string
  ) {
    return this.recurringTxService.findByCategory(req.user.userId, categoryId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming recurring transactions' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days to look ahead' })
  @ApiResponse({ status: 200, description: 'List of upcoming recurring transactions' })
  async getUpcoming(
    @Request() req: RequestWithUser,
    @Query('days') days?: number
  ) {
    return this.recurringTxService.getUpcomingTransactions(req.user.userId, days);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Generate transaction forecast' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days to forecast' })
  @ApiResponse({ status: 200, description: 'Transaction forecast' })
  async getForecast(
    @Request() req: RequestWithUser,
    @Query('days') days?: number
  ) {
    return this.recurringTxService.generateTransactionForecast(req.user.userId, days);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get recurring transaction statistics' })
  @ApiResponse({ status: 200, description: 'Recurring transaction statistics' })
  async getStats(@Request() req: RequestWithUser) {
    return this.recurringTxService.getRecurringTransactionStats(req.user.userId);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a recurring transaction immediately' })
  @ApiParam({ name: 'id', type: String, description: 'Recurring transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction processed successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async processTransaction(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.processTransaction(id, req.user.userId);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip the next occurrence of a recurring transaction' })
  @ApiParam({ name: 'id', type: String, description: 'Recurring transaction ID' })
  @ApiResponse({ status: 200, description: 'Next occurrence skipped successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async skipNextOccurrence(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.skipNextOccurrence(id, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recurring transaction by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Recurring transaction ID' })
  @ApiResponse({ status: 200, description: 'Recurring transaction details' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring transaction' })
  @ApiParam({ name: 'id', type: String, description: 'Recurring transaction ID' })
  @ApiResponse({ status: 200, description: 'Recurring transaction updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateRecurringTransactionDto
  ) {
    return this.recurringTxService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring transaction' })
  @ApiParam({ name: 'id', type: String, description: 'Recurring transaction ID' })
  @ApiResponse({ status: 200, description: 'Recurring transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.recurringTxService.remove(id, req.user.userId);
  }
}
