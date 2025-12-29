import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCardMemberDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID của user cần thêm vào card',
  })
  @IsString()
  @IsUUID()
  user_id!: string;
}

export class RemoveCardMemberDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID của user cần xóa khỏi card',
  })
  @IsString()
  @IsUUID()
  user_id!: string;
}

export class CardMemberResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  user_id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', nullable: true })
  avatar_url?: string;

  @ApiProperty({ example: '2025-12-29T12:00:00.000Z' })
  assigned_at!: Date;
}
