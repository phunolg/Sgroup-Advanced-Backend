import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token?: string;
}
