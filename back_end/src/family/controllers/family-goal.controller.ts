import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { FamilyGoalService } from '../services/family-goal.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups/:groupId/goals')
export class FamilyGoalController {
  constructor(private readonly familyGoalService: FamilyGoalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal for a family group' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createGoalDto: CreateFamilyGoalDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.create(groupId, userId, createGoalDto);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for a family group' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const goals = await this.familyGoalService.findAll(groupId, userId);
    return { 
      success: true, 
      data: goals.map(goal => goal.toResponseFormat()) 
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active goals for a family group' })
  async findActive(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const goals = await this.familyGoalService.findActiveByGroup(groupId, userId);
    return { 
      success: true, 
      data: goals.map(goal => goal.toResponseFormat()) 
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get goal summary for a family group' })
  async getGroupGoalsSummary(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGroupGoalsSummary(groupId, userId);
    return { success: true, data: summary };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.findOne(id, userId);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get detailed summary for a specific goal' })
  async getGoalSummary(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const summary = await this.familyGoalService.getGoalSummary(id, userId);
    return { success: true, data: summary };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a goal' })
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateFamilyGoalDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const goal = await this.familyGoalService.update(id, userId, updateGoalDto);
    return { success: true, data: goal.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyGoalService.remove(id, userId);
    return { success: true, message: 'Goal deleted successfully' };
  }
}
