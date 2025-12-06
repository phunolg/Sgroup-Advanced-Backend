import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Board } from './board.entity';
import { BoardRole } from 'src/common/enum/role/board-role.enum';
import { BoardPermission } from 'src/common/enum/permission/board-permissions.enum';

@Entity('board_members')
export class BoardMember {
  @ApiProperty({ example: '91bbf2a1-8d84-42d0-9d5f-c7850d2feadc' })
  @PrimaryColumn({ type: 'uuid' })
  board_id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @PrimaryColumn({ type: 'uuid' })
  @Index('idx_board_members_user')
  user_id!: string;

  @ApiProperty({ example: 'owner' })
  @Column({ type: 'enum', enum: BoardRole, default: BoardRole.MEMBER })
  role!: BoardRole;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  joined_at!: Date;

  @Column({ type: 'jsonb', default: [] })
  permissions!: BoardPermission[];

  @ManyToOne(() => User, (u) => u.boardMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Board, (b) => b, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board?: Board;
}
