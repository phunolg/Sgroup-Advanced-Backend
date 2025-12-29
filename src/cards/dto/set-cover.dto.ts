import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetCoverDto {
  @ApiPropertyOptional({
    description: 'Attachment ID dùng làm cover cho card',
    example: '91bbf2a1-8d84-42d0-9d5f-c7850d2feadc',
  })
  @IsOptional()
  @IsString()
  attachmentId?: string;

  @ApiPropertyOptional({
    description: 'Màu sắc của cover dưới dạng mã hex (nếu không dùng attachment)',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  color?: string;
}
