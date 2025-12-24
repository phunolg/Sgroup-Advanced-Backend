import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveCardDto {
  @ApiProperty({ description: 'ID của card cần di chuyển' })
  @IsString()
  cardId!: string;

  @ApiProperty({ description: 'ID của list đích' })
  @IsString()
  targetListId!: string;

  @ApiProperty({ description: 'Vị trí mới (index, bắt đầu từ 0) trong list đích' })
  @IsNumber()
  @Min(0)
  newIndex!: number;
}
