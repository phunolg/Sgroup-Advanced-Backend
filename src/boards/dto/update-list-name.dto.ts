import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateListNameDto {
  @ApiProperty({
    example: 'In Progress',
    description: 'New name for the list',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'List name cannot be empty' })
  @MaxLength(255, { message: 'List name cannot exceed 255 characters' })
  name!: string;
}
