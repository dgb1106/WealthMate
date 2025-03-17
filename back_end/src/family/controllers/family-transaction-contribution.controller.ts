import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FamilyTransactionContributionService } from '../services/family-transaction-contribution.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FamilyTransactionContributionController {
  constructor(
    private readonly familyTransactionContributionService: FamilyTransactionContributionService,
  ) {}

  @Post('family-transactions/contributions')
  @ApiOperation({ summary: 'Create a new transaction contribution' })
  async create(@Body() createContributionDto: CreateFamilyTransactionContributionDto, @Req() req) {
    const userId = req.user.id;
    const contribution = await this.familyTransactionContributionService.create(
      userId,
      createContributionDto,
    );
    return { success: true, data: contribution.toResponseFormat() };
  }

  @Get('family-groups/:groupId/contributions')
  @ApiOperation({ summary: 'Get all contributions for a family group' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const contributions = await this.familyTransactionContributionService.findAll(groupId, userId);
    return { 
      success: true, 
      data: contributions.map(contribution => contribution.toResponseFormat()) 
    };
  }

  @Get('family-groups/:groupId/contributions/my')
  @ApiOperation({ summary: 'Get all contributions by the current user in a group' })
  async findByUser(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const contributions = await this.familyTransactionContributionService.findByUser(userId, groupId);
    return { 
      success: true, 
      data: contributions.map(contribution => contribution.toResponseFormat()) 
    };
  }

  @Get('family-groups/:groupId/contributions/stats')
  @ApiOperation({ summary: 'Get contribution statistics for a family group' })
  async getGroupContributionStats(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const stats = await this.familyTransactionContributionService.getGroupContributionStats(groupId, userId);
    return { success: true, data: stats };
  }

  @Get('transactions/:transactionId/contributions')
  @ApiOperation({ summary: 'Get all contributions for a specific transaction' })
  async findByTransaction(@Param('transactionId') transactionId: string, @Req() req) {
    const userId = req.user.id;
    const contributions = await this.familyTransactionContributionService.findByTransaction(transactionId, userId);
    return { 
      success: true, 
      data: contributions.map(contribution => contribution.toResponseFormat()) 
    };
  }

  @Delete('family-transactions/contributions/:id')
  @ApiOperation({ summary: 'Delete a contribution' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyTransactionContributionService.remove(id, userId);
    return { success: true, message: 'Contribution deleted successfully' };
  }
}
