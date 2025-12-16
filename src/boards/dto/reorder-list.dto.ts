import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReorderListDto {
  @ApiProperty({
    description: 'Zero-based index the list should occupy after reordering',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  newIndex!: number;
}
