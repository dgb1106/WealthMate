import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from '../entities/users.entity';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersRepository } from '../repositories/users-repository.interface';
import { UserDomainService } from './user-domain.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository') private readonly usersRepository: UsersRepository,
    private readonly userDomainService: UserDomainService
  ) {}

  /**
   * Create a new user
   * @param registerDto User registration data
   * @returns New user entity
   */
  async createUser(registerDto: RegisterDto): Promise<User> {
    const { email, password } = registerDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await this.userDomainService.hashPassword(password);

    // Create the user via repository
    return this.usersRepository.createUser(registerDto, hashedPassword);
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User entity
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Get user profile with enriched data
   * @param id User ID
   * @returns Enhanced user profile
   */
  async getUserProfile(id: string): Promise<any> {
    const user = await this.getUserById(id);
    return this.userDomainService.enrichUserProfile(user);
  }

  /**
   * Get a user by email
   * @param email User email
   * @returns User entity
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Update user information
   * @param id User ID
   * @param updateUserDto Data to update
   * @returns Updated user entity
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Validate update data
    this.userDomainService.validateUserUpdate(updateUserDto);
    
    // Check if user exists
    await this.getUserById(id);
    
    // Update user via repository
    return this.usersRepository.update(id, updateUserDto);
  }

  /**
   * Delete a user
   * @param id User ID
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    await this.getUserById(id);
    
    // Delete user via repository
    await this.usersRepository.delete(id);
  }

  /**
   * Update user's balance
   * @param id User ID
   * @param amount New balance amount
   * @returns Updated user entity
   */
  async updateBalance(id: string, amount: number): Promise<User> {
    // Check if user exists
    await this.getUserById(id);
    
    // Update balance via repository
    return this.usersRepository.updateBalance(id, amount);
  }

  /**
   * Update user password
   * @param userId User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get stored password hash
    const passwordHash = await this.usersRepository.getUserPasswordHash(userId);
    
    if (!passwordHash) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, passwordHash);
    if (!passwordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await this.usersRepository.updatePassword(userId, hashedNewPassword);
    
    // Invalidate existing tokens
    await this.usersRepository.deleteAllUserTokens(userId);
    
    return { success: true };
  }
}