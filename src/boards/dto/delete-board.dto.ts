import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteBoardDto {
  @ApiProperty({
    required: false,
    description: 'Set to true to force delete an OPEN board',
  })
  @IsOptional() // Không bắt buộc phải gửi
  @IsBoolean()
  confirm?: boolean;
}
