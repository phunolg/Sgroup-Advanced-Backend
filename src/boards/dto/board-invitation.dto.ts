import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardInvitationDto {
  @ApiProperty({ description: 'Email của người được mời', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  invited_email?: string;

  @ApiProperty({ description: 'User ID nếu mời người dùng hiện tại', example: 'uuid-here' })
  @IsString()
  @IsOptional()
  invited_user_id?: string;
}

export class FindBoardInvitationDto {
  @ApiProperty({ description: 'Invitation token', example: 'abc123def456' })
  @IsString()
  token!: string;
}
