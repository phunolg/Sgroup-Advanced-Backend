import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardRole } from 'src/common/enum/role/board-role.enum';

export class CreateListDto {
  @ApiProperty({ example: 'To Do' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'To Do' })
  @IsString()
  name!: string;
}

export class UpdateListDto {
  @ApiProperty({ example: 'In Progress' })
  @IsString()
  title?: string;

  @ApiProperty({ example: 'In Progress' })
  @IsString()
  name?: string;

  @ApiProperty({ example: '1' })
  @IsString()
  position?: string;
}

export class AddBoardMemberDto {
  @ApiProperty({ example: '1' })
  @IsString()
  user_id!: string;

  @ApiProperty({ example: 'member', enum: ['owner', 'member'] })
  @IsEnum(BoardRole)
  role!: BoardRole;
}

export class UpdateBoardMemberDto {
  @ApiProperty({ example: 'member', enum: ['owner', 'member'] })
  @IsEnum(BoardRole)
  role!: BoardRole;
}

export class CreateLabelDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '#ff0000' })
  @IsString()
  color!: string;
}

export class UpdateLabelDto {
  @ApiProperty({ example: 'Feature' })
  @IsString()
  name?: string;

  @ApiProperty({ example: '#00ff00' })
  @IsString()
  color?: string;
}
