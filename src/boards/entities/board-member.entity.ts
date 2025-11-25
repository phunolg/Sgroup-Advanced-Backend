import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Board } from './board.entity';

@Entity('board_members')
export class BoardMember {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  board_id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @PrimaryColumn({ type: 'uuid' })
  @Index('idx_board_members_user')
  user_id!: string;

  @ApiProperty({ example: 'owner' })
  @Column({ type: 'text', default: 'member' })
  role!: 'owner' | 'member';

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  joined_at!: Date;

  @ManyToOne(() => User, (u) => u.boardMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Board, (b) => b, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board?: Board;
}
