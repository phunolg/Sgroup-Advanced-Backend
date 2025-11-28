import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArchiveBoardDto {
  @ApiProperty({
    example: true,
    description: 'Set true to Archive, false to Reopen',
  })
  @IsNotEmpty()
  @IsBoolean()
  is_closed!: boolean;
}
