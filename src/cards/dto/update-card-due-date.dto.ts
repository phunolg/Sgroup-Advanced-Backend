import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateCardDueDateDto {
  @ApiProperty({ example: '2025-12-31T23:59:59Z', description: 'Ngày bắt đầu (start date)' })
  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @ApiProperty({ example: '2025-12-31T23:59:59Z', description: 'Ngày kết thúc (deadline)' })
  @IsOptional()
  @IsDateString()
  end_date?: string | null;

  @ApiProperty({ example: true, description: 'Trạng thái hoàn thành' })
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}
