import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FamilyInvitationService } from '../services/family-invitation.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateFamilyInvitationDto } from '../dto/create-family-invitation.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family Invitations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class FamilyInvitationController {
  constructor(private readonly familyInvitationService: FamilyInvitationService) {}

  @Post('family-groups/:groupId/invitations')
  @ApiOperation({ summary: 'Create a new invitation for a family group' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createInvitationDto: CreateFamilyInvitationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const invitation = await this.familyInvitationService.create(
      groupId,
      userId,
      createInvitationDto,
    );
    return { success: true, data: invitation.toResponseFormat() };
  }

  @Get('family-groups/:groupId/invitations')
  @ApiOperation({ summary: 'Get all invitations for a family group' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const invitations = await this.familyInvitationService.findAll(groupId, userId);
    return { 
      success: true, 
      data: invitations.map(invitation => invitation.toResponseFormat()) 
    };
  }

  @Get('invitations/my')
  @ApiOperation({ summary: 'Get all invitations for the current user' })
  async findMyInvitations(@Req() req) {
    const userId = req.user.id;
    const invitations = await this.familyInvitationService.findMyInvitations(userId);
    return { 
      success: true, 
      data: invitations.map(invitation => invitation.toResponseFormat()) 
    };
  }

  @Post('invitations/:id/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  async acceptInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.acceptInvitation(id, userId);
    return { success: true, message: 'Invitation accepted successfully' };
  }

  @Post('invitations/:id/reject')
  @ApiOperation({ summary: 'Reject an invitation' })
  async rejectInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.rejectInvitation(id, userId);
    return { success: true, message: 'Invitation rejected successfully' };
  }

  @Post('invitations/:id/cancel')
  @ApiOperation({ summary: 'Cancel an invitation (for group admins only)' })
  async cancelInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.cancelInvitation(id, userId);
    return { success: true, message: 'Invitation cancelled successfully' };
  }
}
