import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersService } from "../users/services/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.users.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.hash_password))) {
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      
      // Store token in database
      await this.storeToken(user.id, token);
      
      return token;
    }

    return null;
  }

  async register(registerDto: RegisterDto) {
    // Create the user
    const user = await this.usersService.createUser(registerDto);
    
    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    
    // Store token in database
    await this.storeToken(user.id, token);
    
    return {
      user,
      token
    };
  }

  // Store JWT token in database
  async storeToken(userId: string, token: string) {
    const expiresIn = 60 * 60 * 1000; // 1 hour in milliseconds
    const expiresAt = new Date(Date.now() + expiresIn);
    
    await this.prisma.jWT.create({
      data: {
        userId,
        token,
        expires_at: expiresAt,
        created_at: new Date()
      }
    });
  }
}