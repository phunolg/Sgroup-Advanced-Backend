import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveCardDto {
  @ApiProperty({ description: 'ID của list đích', example: '91bbf2a1-8d84-42d0-9d5f-c7850d2feadc' })
  @IsString()
  targetListId!: string;

  @ApiProperty({ description: 'Vị trí mới (index, bắt đầu từ 0) trong list đích', example: 2 })
  @IsNumber()
  @Min(0)
  newIndex!: number;
}
