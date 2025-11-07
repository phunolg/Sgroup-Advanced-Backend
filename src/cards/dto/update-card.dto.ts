import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;
}
