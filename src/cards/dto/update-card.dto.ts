import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiPropertyOptional({
    example: '91bbf2a1-8d84-42d0-9d5f-c7850d2feadc',
    description: 'Board ID (automatically updated when list changes)',
  })
  @IsUUID()
  @IsOptional()
  board_id?: string;
}
