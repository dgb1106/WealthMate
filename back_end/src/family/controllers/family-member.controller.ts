import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { FamilyMemberService } from '../services/family-member.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UpdateFamilyMemberRoleDto } from '../dto/update-family-member-role.dto';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Members')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('family-groups/:groupId/members')
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Get()
  @ApiOperation({ summary: 'Get all members of a family group' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const members = await this.familyMemberService.findAll(groupId, userId);
    return { 
      success: true, 
      data: members.map(member => member.toResponseFormat())
    };
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Add a user to the family group' })
  async addMember(
    @Param('groupId') groupId: string,
    @Param('userId') newUserId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    const member = await this.familyMemberService.addMember(groupId, newUserId, userId);
    return { success: true, data: member.toResponseFormat() };
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update a member\'s role' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateFamilyMemberRoleDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const member = await this.familyMemberService.updateRole(id, updateRoleDto, userId);
    return { success: true, data: member.toResponseFormat() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a member from the family group' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyMemberService.remove(id, userId);
    return { success: true, message: 'Member removed successfully' };
  }

  @Post('transfer-ownership')
  @ApiOperation({ summary: 'Transfer group ownership to another member' })
  async transferOwnership(
    @Param('groupId') groupId: string,
    @Body() transferDto: TransferOwnershipDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.familyMemberService.transferOwnership(groupId, transferDto, userId);
    return { success: true, message: 'Ownership transferred successfully' };
  }

  @Delete('leave')
  @ApiOperation({ summary: 'Leave the family group' })
  async leaveGroup(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    await this.familyMemberService.leaveGroup(groupId, userId);
    return { success: true, message: 'You have left the group' };
  }
}
