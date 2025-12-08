import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CopyListDto {
  @ApiProperty({
    description: 'ID of the target board where list will be copied to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  targetBoardId!: string;

  @ApiProperty({
    description:
      'Optional custom name for the copied list. If not provided, will use "[original_name] (copy)"',
    example: 'My Custom List Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  newName?: string;
}
