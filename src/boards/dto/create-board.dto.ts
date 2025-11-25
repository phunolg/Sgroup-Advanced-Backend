import { IsString, IsOptional, IsBoolean, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ example: 'Project Alpha' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Board for project management' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  cover_url?: string;

  @ApiProperty({
    example: 'workspace-uuid',
    description: 'Workspace ID where the board will be created',
  })
  @IsString()
  @IsNotEmpty()
  workspace_id!: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  is_closed?: boolean;
}
