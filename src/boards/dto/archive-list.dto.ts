import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArchiveListDto {
  @ApiProperty({
    example: true,
    description: 'Set to true to archive the list, false to unarchive',
  })
  @IsBoolean()
  archived!: boolean;
}
