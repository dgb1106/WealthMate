import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    this.logger.log(`User accessing profile: ${JSON.stringify(req.user)}`);
    return this.usersService.getUserById(req.user.id);
  }

  @Post()
  createUser(@Body() registerDto: RegisterDto) {
    return this.usersService.createUser(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/balance')
  updateBalance(@Param('id') id: string, @Body('amount') amount: number) {
    return this.usersService.updateBalance(id, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/financial-profile')
  getUserFinancialProfile(@Param('id') id: string) {
    return this.usersService.getUserFinancialProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/financial-summary')
  getFinancialSummary(@Param('id') id: string) {
    return this.usersService.getFinancialSummary(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body('currentPassword') currentPassword: string, @Body('newPassword') newPassword: string) {
    return this.usersService.updatePassword(id, currentPassword, newPassword);
  }
}