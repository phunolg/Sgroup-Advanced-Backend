import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123token', description: 'Reset password token from email' })
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsNotEmpty()
  @MinLength(6)
  new_password!: string;

  @ApiProperty({ example: 'newPassword123', description: 'Confirm new password' })
  @IsNotEmpty()
  confirm_password!: string;
}
