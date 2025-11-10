import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: '123', description: 'ID của user cần thêm' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
