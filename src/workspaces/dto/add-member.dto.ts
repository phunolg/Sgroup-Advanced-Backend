import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email của user cần thêm' })
  @IsString()
  @IsNotEmpty()
  email!: string;
}
