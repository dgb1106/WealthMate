import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, Req } from '@nestjs/common';
import { FamilyGroupService } from '../services/family-group.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyGroupDto } from '../dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '../dto/update-family-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiTags('family-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups')
export class FamilyGroupController {
  constructor(private readonly familyGroupService: FamilyGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family group' })
  @ApiBody({ type: CreateFamilyGroupDto })
  @ApiResponse({ status: 201, description: 'The family group has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createFamilyGroupDto: CreateFamilyGroupDto, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const group = await this.familyGroupService.create(userId, createFamilyGroupDto);
    return { success: true, data: group.toResponseFormat() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all family groups for the current user' })
  @ApiResponse({ status: 200, description: 'List of family groups the user is a member of.' })
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const groups = await this.familyGroupService.findAll(userId);
    return { 
      success: true, 
      data: groups.map(group => group.toResponseFormat())
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for family groups by name or description' })
  @ApiResponse({ status: 200, description: 'List of family groups matching the search term.' })
  async search(@Query('term') searchTerm: string) {
    const groups = await this.familyGroupService.searchGroups(searchTerm);
    return { 
      success: true, 
      data: groups.map(group => group.toResponseFormat())
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific family group by ID' })
  @ApiParam({ name: 'id', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'The family group.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const group = await this.familyGroupService.findOne(id, userId);
    return { success: true, data: group.toResponseFormat() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a family group' })
  @ApiParam({ name: 'id', description: 'Family group ID' })
  @ApiBody({ type: UpdateFamilyGroupDto })
  @ApiResponse({ status: 200, description: 'The family group has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyGroupDto: UpdateFamilyGroupDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const group = await this.familyGroupService.update(id, userId, updateFamilyGroupDto);
    return { success: true, data: group.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a family group' })
  @ApiParam({ name: 'id', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'The family group has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    await this.familyGroupService.remove(id, userId);
    return { success: true, message: 'Group deleted successfully' };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a family group' })
  @ApiResponse({ status: 200, description: 'List of members in the family group.' })
  async getGroupMembers(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const members = await this.familyGroupService.getGroupMembers(id, userId);
    return { success: true, data: members };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get summary statistics for a family group' })
  @ApiResponse({ status: 200, description: 'Summary statistics for the family group.' })
  async getGroupSummary(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const summary = await this.familyGroupService.getGroupSummary(id, userId);
    return { success: true, data: summary };
  }
}
