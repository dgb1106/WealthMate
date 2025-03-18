import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FamilyTransactionContributionService } from '../services/family-transaction-contribution.service';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Đóng góp giao dịch gia đình')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family/groups/:groupId/contributions')
export class FamilyTransactionContributionController {
  constructor(private readonly familyTransactionContributionService: FamilyTransactionContributionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đóng góp giao dịch mới cho nhóm gia đình' })
  create(@Request() req, @Body() createContributionDto: CreateFamilyTransactionContributionDto) {
    return this.familyTransactionContributionService.create(req.user.id, createContributionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả đóng góp giao dịch của nhóm gia đình' })
  async findAll(
    @Param('groupId') groupId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.familyTransactionContributionService.findAll(groupId, paginationDto);
    
    return {
      ...result,
      data: result.data.map(contribution => contribution.toResponseFormat())
    };
  }

  @Get('my')
  @ApiOperation({ summary: 'Lấy tất cả đóng góp của người dùng hiện tại trong nhóm' })
  async findByUser(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    const contributions = await this.familyTransactionContributionService.findByUser(userId, groupId);
    return { 
      success: true, 
      data: contributions.map(contribution => contribution.toResponseFormat()) 
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê đóng góp của nhóm gia đình' })
  async getGroupContributionStats(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    const stats = await this.familyTransactionContributionService.getGroupContributionStats(groupId, userId);
    return { success: true, data: stats };
  }

  @Get('transactions/:transactionId')
  @ApiOperation({ summary: 'Lấy tất cả đóng góp cho một giao dịch cụ thể' })
  async findByTransaction(@Param('transactionId') transactionId: string, @Request() req) {
    const userId = req.user.id;
    const contributions = await this.familyTransactionContributionService.findByTransaction(transactionId, userId);
    return { 
      success: true, 
      data: contributions.map(contribution => contribution.toResponseFormat()) 
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một đóng góp' })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.familyTransactionContributionService.remove(id, userId);
    return { success: true, message: 'Contribution deleted successfully' };
  }
}
