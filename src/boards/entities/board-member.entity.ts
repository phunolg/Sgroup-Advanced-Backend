import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Board } from './board.entity';

@Entity('board_members')
export class BoardMember {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  board_id!: string;

  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  @Index('idx_board_members_user')
  user_id!: string;

  @ApiProperty({ example: 'admin' })
  @Column({ type: 'text', default: 'normal' })
  role!: 'admin' | 'normal' | 'observer';

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
