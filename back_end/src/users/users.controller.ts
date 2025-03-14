import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiBody({ type: RegisterDto })
  async createUser(@Body() registerDto: RegisterDto) {
    return this.usersService.createUser(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getUserProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getUserById(@Param('id') id: string, @Request() req) {
    // Users can only access their own data unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to other users\' data');
    }
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // Users can only update their own data unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to modify other users');
    }
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async deleteUser(@Param('id') id: string, @Request() req) {
    // Users can only delete their own account unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to delete other users');
    }
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/balance')
  @ApiOperation({ summary: 'Update user balance' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: Number })
  @ApiResponse({ status: 200, description: 'Balance updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async updateBalance(
    @Param('id') id: string, 
    @Body('amount') amount: number,
    @Request() req
  ) {
    // Users can only update their own balance unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to modify other users\' balance');
    }
    
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
    
    return this.usersService.updateBalance(id, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/balance/increase')
  @ApiOperation({ summary: 'Increase user balance' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: Number })
  @ApiResponse({ status: 200, description: 'Balance increased successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async increaseBalance(
    @Param('id') id: string, 
    @Body('amount') amount: number,
    @Request() req
  ) {
    // Users can only update their own balance unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to modify other users\' balance');
    }
    
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
    
    return this.usersService.increaseBalance(id, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async updatePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Request() req
  ) {
    // Users can only change their own password unless they're admins
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied to change other users\' password');
    }
    
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }
    
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }
    
    return this.usersService.updatePassword(id, currentPassword, newPassword);
  }
}