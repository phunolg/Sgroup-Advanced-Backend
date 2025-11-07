import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../users/entities/user.entity';
import { MailService } from '../../mail/mail.service';
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
    private readonly mailService: MailService,
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

    // Check if email is verified
    if (!user.is_email_verified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // gen JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
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

  async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    const { email, name, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      is_active: true,
      is_deleted: false,
      is_email_verified: false,
      roles: ['user'], // Default role
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Send verification email
    await this.mailService.sendVerificationEmail(
      savedUser.email,
      savedUser.name,
      verificationToken,
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: savedUser.email,
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
        is_email_verified: user.is_email_verified,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return null;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refresh_token } = refreshTokenDto;

    // verify
    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // tạo access token mới
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
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

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.is_email_verified) {
      return { message: 'Email already verified' };
    }

    if (user.verification_token_expires && user.verification_token_expires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    user.is_email_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await this.userRepository.save(user);

    // Send welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.name);

    return { message: 'Email verified successfully. You can now login.' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.verification_token = verificationToken;
    user.verification_token_expires = verificationExpires;
    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: 'Verification email sent successfully' };
  }
}
