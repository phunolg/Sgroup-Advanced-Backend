import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty() @IsString() url!: string;
  @ApiProperty() @IsString() file_name!: string;
  @ApiProperty() @IsString() size_bytes!: string;
  @ApiProperty() @IsString() mime_type!: string;
}
