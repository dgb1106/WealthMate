import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, Request } from '@nestjs/common';
import { FamilyBudgetService } from '../services/family-budget.service';
import { FamilyBudgetSchedulerService } from '../services/family-budget-scheduler.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody
} from '@nestjs/swagger';

@ApiTags('family-budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-budgets')
export class FamilyBudgetController {
  constructor(
    private readonly familyBudgetService: FamilyBudgetService,
    private readonly familyBudgetSchedulerService: FamilyBudgetSchedulerService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new budget for a family group',
    description: 'Creates a new budget for the specified family group. User must be a member with budget management permissions.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiBody({ type: CreateFamilyBudgetDto })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Family group not found' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createBudgetDto: CreateFamilyBudgetDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const budget = await this.familyBudgetService.create(groupId, userId, createBudgetDto);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all budgets for a family group',
    description: 'Retrieves all budgets for the specified family group. User must be a member of the group.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of family budgets' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Family group not found' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.userId;
    const budgets = await this.familyBudgetService.findAll(groupId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Get all active budgets for a family group',
    description: 'Retrieves active budgets (current date falls within budget period) for the specified family group.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of active family budgets' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  async findActive(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.userId;
    const budgets = await this.familyBudgetService.findActiveByGroup(groupId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('category/:categoryId')
  @ApiOperation({ 
    summary: 'Get all budgets by category for a family group',
    description: 'Retrieves all budgets for a specific category in the family group.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'List of family budgets for the category' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  async findByCategory(
    @Param('groupId') groupId: string,
    @Param('categoryId') categoryId: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const budgets = await this.familyBudgetService.findByCategory(groupId, categoryId, userId);
    return { 
      success: true, 
      data: budgets.map(budget => budget.toResponseFormat()) 
    };
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get budget summary for a family group',
    description: 'Retrieves a summary of all budgets for the family group, including totals and statistics.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'Budget summary for the family group' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  async getGroupBudgetSummary(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.userId;
    const summary = await this.familyBudgetService.getGroupBudgetSummary(groupId, userId);
    return { success: true, data: summary };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific budget by ID',
    description: 'Retrieves a specific family budget by its ID.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'The family budget' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    const budget = await this.familyBudgetService.findOne(id, userId);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a budget',
    description: 'Updates a specific family budget. User must be the creator or have admin/owner role.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiBody({ type: UpdateFamilyBudgetDto })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateFamilyBudgetDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const budget = await this.familyBudgetService.update(id, userId, updateBudgetDto);
    return { success: true, data: budget.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a budget',
    description: 'Deletes a specific family budget. User must be the creator or have admin/owner role.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    await this.familyBudgetService.remove(id, userId);
    return { success: true, message: 'Budget deleted successfully' };
  }

  @Post('refresh-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually trigger budget refresh for all active budgets' })
  @ApiResponse({ status: 200, description: 'Budgets successfully refreshed' })
  async refreshAllBudgets(@Request() req): Promise<any> {
    return this.familyBudgetSchedulerService.manualUpdateAllActiveBudgets();
  }
}
