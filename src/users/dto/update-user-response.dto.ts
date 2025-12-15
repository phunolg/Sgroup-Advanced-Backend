import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UpdateUserResponseDto {
  @ApiProperty({
    description: 'User data (without password and verification_token)',
    example: {
      id: 'user-uuid',
      email: 'user@example.com',
      name: 'John Doe',
      created_at: '2025-01-01T00:00:00Z',
    },
  })
  user!: Omit<User, 'password' | 'verification_token'>;

  @ApiProperty({
    example: null,
    description:
      'Message if email was updated (user needs to verify new email). Null if only other fields were updated.',
  })
  message?: string | null;
}
