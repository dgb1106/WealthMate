import { Controller, Post, Body, UnauthorizedException, Res, Req, Get } from "@nestjs/common";
import { Response, Request } from 'express';
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { ApiProperty, ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";

@ApiTags('auth')
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post("login")
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công.',
    schema: {
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        message: { type: 'string', example: 'Login successful' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không đúng.' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.validateUser(loginDto);
    if (!token) {
      throw new UnauthorizedException("Invalid credentials");
    }
    
    // Install cookie with JWT token
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });
    
    return { token, message: 'Login successful' };
  }

  @Post("register")
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tài khoản đã được tạo thành công.',
    schema: {
      properties: {
        user: { 
          type: 'object',
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            userId: { type: 'string', example: '123456789' }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        message: { type: 'string', example: 'Registration successful' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại trong hệ thống.' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    
    // Install cookie with JWT token
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });
    
    return { user: result.user, token: result.token, message: 'Registration successful' };
  }

  @Get("check")
  @ApiOperation({ summary: 'Kiểm tra trạng thái xác thực' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trạng thái xác thực.',
    schema: {
      properties: {
        isAuthenticated: { type: 'boolean', example: true },
        user: { 
          type: 'object',
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            userId: { type: 'string', example: '123456789' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  async checkAuthStatus(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Check if the user has a valid token
    const token = req.cookies['auth_token'];
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    try {
      // Decode the token to get user information
      const decoded = this.jwtService.verify(token);
      return { 
        isAuthenticated: true,
        user: { 
          email: decoded.email,
          userId: decoded.sub
        }
      };
    } catch (error) {
      // If the token is invalid, clear the cookie
      res.clearCookie('auth_token');
      return { isAuthenticated: false };
    }
  }

  @Post("logout")
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công.' })
  @ApiResponse({ status: 401, description: 'Không được phép truy cập.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}