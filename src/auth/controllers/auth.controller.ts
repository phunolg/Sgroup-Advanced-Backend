import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '../dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerDto: RegisterDto,
  ): Promise<LoginResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async refreshToken(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
