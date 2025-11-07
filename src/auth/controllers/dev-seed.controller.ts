import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../users/entities/user.entity';

type SeedBody = {
  email?: string;
  password?: string;
  name?: string;
};

@Controller('auth')
export class DevSeedController {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  @Public()
  @Post('dev-seed')
  @HttpCode(HttpStatus.OK)
  async seed(@Body() body: SeedBody) {
    // Only allow in non-production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED !== 'true') {
      return { ok: false, message: 'Dev seed disabled in production' };
    }

    const email = body.email || 'demo@example.com';
    const password = body.password || 'secret123';
    const name = body.name || 'Demo User';

    let user = await this.users.findOne({ where: { email } });
    const hashed = await bcrypt.hash(password, 10);

    if (!user) {
      user = this.users.create({
        email,
        name,
        password: hashed,
        is_active: true,
        is_deleted: false,
        is_email_verified: true,
        roles: ['user'],
      });
    } else {
      user.name = name;
      user.password = hashed;
      user.is_active = true;
      user.is_deleted = false;
      user.is_email_verified = true;
      user.roles = user.roles?.length ? user.roles : ['user'];
    }

    await this.users.save(user);

    return {
      ok: true,
      email: user.email,
      password,
      note: 'Use these credentials to login. This endpoint is for local dev only.',
    };
  }
}
