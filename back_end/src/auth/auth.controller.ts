import { Controller, Post, Body, UnauthorizedException, Res, Req, Get } from "@nestjs/common";
import { Response, Request } from 'express';
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.validateUser(loginDto);
    if (!token) {
      throw new UnauthorizedException("Invalid credentials");
    }
    
    // Thiết lập cookie với token JWT
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });
    
    return { token, message: 'Login successful' };
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    
    // Thiết lập cookie với token JWT 
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });
    
    return { user: result.user, token: result.token, message: 'Registration successful' };
  }

  @Get("check")
  async checkAuthStatus(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Kiểm tra cookie token
    const token = req.cookies['auth_token'];
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    try {
      // Xác thực token
      const decoded = this.jwtService.verify(token);
      return { 
        isAuthenticated: true,
        user: { 
          email: decoded.email,
          userId: decoded.sub
        }
      };
    } catch (error) {
      // Token không hợp lệ hoặc hết hạn
      res.clearCookie('auth_token');
      return { isAuthenticated: false };
    }
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}