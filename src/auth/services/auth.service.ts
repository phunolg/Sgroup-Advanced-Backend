import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '../dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.name,
        fullName: user.name,
      },
      expires_in: 15 * 60,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const { email, name, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      is_active: true,
      is_deleted: false,
    });

    const savedUser = await this.userRepository.save(newUser);
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.name,
        fullName: savedUser.name,
      },
      expires_in: 15 * 60,
    };
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_deleted: user.is_deleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return null;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refresh_token } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return {
        access_token: newAccessToken,
        expires_in: 15 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
