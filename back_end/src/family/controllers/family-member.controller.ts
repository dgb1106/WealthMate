import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { FamilyMemberService } from '../services/family-member.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateFamilyMemberRoleDto } from '../dto/update-family-member-role.dto';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiTags('family-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-groups/:groupId/members')
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Get()
  @ApiOperation({ summary: 'Get all members of a family group' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of family group members.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async findAll(@Param('groupId') groupId: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const members = await this.familyMemberService.findAll(groupId, userId);
    return { 
      success: true, 
      data: members.map(member => member.toResponseFormat())
    };
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Add a user to the family group' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User added to the family group.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async addMember(
    @Param('groupId') groupId: string,
    @Param('userId') newUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const member = await this.familyMemberService.addMember(groupId, newUserId, userId);
    return { success: true, data: member.toResponseFormat() };
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update a member\'s role' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiBody({ type: UpdateFamilyMemberRoleDto })
  @ApiResponse({ status: 200, description: 'The member\'s role has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateFamilyMemberRoleDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const member = await this.familyMemberService.updateRole(id, updateRoleDto, userId);
    return { success: true, data: member.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove a member from the family group',
    description: 'Remove a member from the family group. Admins can remove members, owners can remove anyone including admins.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'The member has been successfully removed.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    await this.familyMemberService.remove(id, userId);
    return { success: true, message: 'Member removed successfully' };
  }

  @Post('transfer-ownership')
  @ApiOperation({ summary: 'Transfer group ownership to another member' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiBody({ type: TransferOwnershipDto })
  @ApiResponse({ status: 200, description: 'Ownership transferred successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async transferOwnership(
    @Param('groupId') groupId: string,
    @Body() transferDto: TransferOwnershipDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    await this.familyMemberService.transferOwnership(groupId, transferDto, userId);
    return { success: true, message: 'Ownership transferred successfully' };
  }

  @Delete('leave')
  @ApiOperation({ summary: 'Leave the family group' })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'You have left the group.' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Family group not found.' })
  async leaveGroup(@Param('groupId') groupId: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    await this.familyMemberService.leaveGroup(groupId, userId);
    return { success: true, message: 'You have left the group' };
  }
}
