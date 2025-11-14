import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  current_password!: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  new_password!: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  confirm_password!: string;
}
