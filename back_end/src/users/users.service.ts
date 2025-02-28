import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.users.findMany();
  }
  
  async createUser(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Check if phone already exists
    const existingPhone = await this.prisma.users.findUnique({
      where: { phone: registerDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already in use');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create new user
    const newUser = await this.prisma.users.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        city: registerDto.city,
        district: registerDto.district,
        job: registerDto.job,
        preferred_mood: registerDto.preferred_mood,
        preferred_goal: registerDto.preferred_goal,
        hash_password: hashedPassword,
        current_balance: 0,
        create_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Return user without password
    const { hash_password, ...result } = newUser;
    return result;
  }
}