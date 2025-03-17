import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { FamilyBudgetService } from '../services/family-budget.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups/:groupId/budgets')
export class FamilyBudgetController {
  constructor(private readonly familyBudgetService: FamilyBudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget for a family group' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createBudgetDto: CreateFamilyBudgetDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const budget = await this.familyBudgetService.create(groupId, userId, createBudgetDto);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for a family group' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const budgets = await this.familyBudgetService.findAll(groupId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active budgets for a family group' })
  async findActive(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const budgets = await this.familyBudgetService.findActiveByGroup(groupId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all budgets by category for a family group' })
  async findByCategory(
    @Param('groupId') groupId: string,
    @Param('categoryId') categoryId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    const budgets = await this.familyBudgetService.findByCategory(groupId, categoryId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary for a family group' })
  async getGroupBudgetSummary(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const summary = await this.familyBudgetService.getGroupBudgetSummary(groupId, userId);
    return { success: true, data: summary };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific budget by ID' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const budget = await this.familyBudgetService.findOne(id, userId);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateFamilyBudgetDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const budget = await this.familyBudgetService.update(id, userId, updateBudgetDto);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyBudgetService.remove(id, userId);
    return { success: true, message: 'Budget deleted successfully' };
  }
}
