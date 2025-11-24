import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'User ID (UUID)' })
  id!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name!: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar_url?: string;

  @ApiProperty({ example: true, description: 'Is user active' })
  is_active!: boolean;

  @ApiProperty({ example: true, description: 'Is email verified' })
  is_email_verified!: boolean;

  @ApiProperty({ example: ['user'], description: 'User roles' })
  roles!: string[];

  @ApiProperty({ example: '2025-11-24T10:30:00.000Z', description: 'Account creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-11-24T10:30:00.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
