import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<Omit<User, 'password' | 'verification_token'>> {
    console.log('Service findById called with:', id, 'Type:', typeof id);

    const user = await this.userRepository.findOne({
      where: { id, is_deleted: false },
      select: [
        'id',
        'email',
        'name',
        'avatar_url',
        'is_active',
        'is_deleted',
        'is_email_verified',
        'roles',
        'createdAt',
        'updatedAt',
      ],
    });

    console.log('Query result:', user ? 'Found user' : 'No user found');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as Omit<User, 'password' | 'verification_token'>;
  }

  async findAll(): Promise<Omit<User, 'password' | 'verification_token'>[]> {
    const users = await this.userRepository.find({
      where: { is_deleted: false },
      select: [
        'id',
        'email',
        'name',
        'avatar_url',
        'is_active',
        'is_email_verified',
        'roles',
        'createdAt',
        'updatedAt',
      ],
    });

    console.log('Found users count:', users.length);
    console.log(
      'User IDs:',
      users.map((u) => ({ id: u.id, type: typeof u.id })),
    );

    return users;
  }
}
