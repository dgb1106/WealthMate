import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, Req } from '@nestjs/common';
import { FamilyGroupService } from '../services/family-group.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateFamilyGroupDto } from '../dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '../dto/update-family-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('family-groups')
export class FamilyGroupController {
  constructor(private readonly familyGroupService: FamilyGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family group' })
  async create(@Body() createFamilyGroupDto: CreateFamilyGroupDto, @Req() req) {
    const userId = req.user.id;
    const group = await this.familyGroupService.create(userId, createFamilyGroupDto);
    return { success: true, data: group.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all family groups for the current user' })
  async findAll(@Req() req) {
    const userId = req.user.id;
    const groups = await this.familyGroupService.findAll(userId);
    return { 
      success: true, 
      data: groups.map(group => group.toResponseFormat())
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for family groups by name or description' })
  async search(@Query('term') searchTerm: string) {
    const groups = await this.familyGroupService.searchGroups(searchTerm);
    return { 
      success: true, 
      data: groups.map(group => group.toResponseFormat())
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific family group by ID' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const group = await this.familyGroupService.findOne(id, userId);
    return { success: true, data: group.toResponseFormat() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a family group' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyGroupDto: UpdateFamilyGroupDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const group = await this.familyGroupService.update(id, userId, updateFamilyGroupDto);
    return { success: true, data: group.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a family group' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyGroupService.remove(id, userId);
    return { success: true, message: 'Group deleted successfully' };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a family group' })
  async getGroupMembers(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const members = await this.familyGroupService.getGroupMembers(id, userId);
    return { success: true, data: members };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get summary statistics for a family group' })
  async getGroupSummary(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const summary = await this.familyGroupService.getGroupSummary(id, userId);
    return { success: true, data: summary };
  }
}
