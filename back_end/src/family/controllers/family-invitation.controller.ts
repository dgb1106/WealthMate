import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FamilyInvitationService } from '../services/family-invitation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFamilyInvitationDto } from '../dto/create-family-invitation.dto';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('family-invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FamilyInvitationController {
  constructor(private readonly familyInvitationService: FamilyInvitationService) {}

  @Post('family-groups/:groupId/invitations')
  @ApiOperation({ 
    summary: 'Create a new invitation for a family group',
    description: 'Invites a user to join a family group. Requires admin or owner permissions in the group.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiBody({ type: CreateFamilyInvitationDto })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Group or user not found' })
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
  @ApiOperation({ 
    summary: 'Get all invitations for a family group',
    description: 'Retrieves all invitations for a specific family group. Requires membership in the group.'
  })
  @ApiParam({ name: 'groupId', description: 'Family group ID' })
  @ApiResponse({ status: 200, description: 'List of invitations for the group' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findAll(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    const invitations = await this.familyInvitationService.findAll(groupId, userId);
    return { 
      success: true, 
      data: invitations.map(invitation => invitation.toResponseFormat()) 
    };
  }

  @Get('invitations/my')
  @ApiOperation({ 
    summary: 'Get all invitations for the current user',
    description: 'Retrieves all invitations sent to the current user, pending or processed.'
  })
  @ApiResponse({ status: 200, description: 'List of invitations for the current user' })
  async findMyInvitations(@Req() req) {
    const userId = req.user.id;
    const invitations = await this.familyInvitationService.findMyInvitations(userId);
    return { 
      success: true, 
      data: invitations.map(invitation => invitation.toResponseFormat()) 
    };
  }

  @Post('invitations/:id/accept')
  @ApiOperation({ 
    summary: 'Accept an invitation',
    description: 'Accepts a pending invitation to join a family group.'
  })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invitation already processed' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async acceptInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.acceptInvitation(id, userId);
    return { success: true, message: 'Invitation accepted successfully' };
  }

  @Post('invitations/:id/reject')
  @ApiOperation({ 
    summary: 'Reject an invitation',
    description: 'Rejects a pending invitation to join a family group.'
  })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation rejected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invitation already processed' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async rejectInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.rejectInvitation(id, userId);
    return { success: true, message: 'Invitation rejected successfully' };
  }

  @Post('invitations/:id/cancel')
  @ApiOperation({ 
    summary: 'Cancel an invitation (for group admins only)',
    description: 'Cancels a pending invitation. Requires admin or owner permissions in the group.'
  })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request, insufficient permissions, or invitation already processed' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async cancelInvitation(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.familyInvitationService.cancelInvitation(id, userId);
    return { success: true, message: 'Invitation cancelled successfully' };
  }
}
