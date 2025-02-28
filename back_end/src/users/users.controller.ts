import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    this.logger.log(`User accessing profile: ${JSON.stringify(req.user)}`);
    return { message: 'This is a protected route', user: req.user };
  }
}