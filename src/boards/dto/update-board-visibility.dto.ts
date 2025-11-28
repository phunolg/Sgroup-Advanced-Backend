import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardVisibility } from '../entities/board.entity';

export class UpdateBoardVisibilityDto {
  @ApiProperty({ enum: BoardVisibility, description: 'Visibility status of the board' })
  @IsNotEmpty()
  @IsEnum(BoardVisibility)
  visibility!: BoardVisibility;
}
