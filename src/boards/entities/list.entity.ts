import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Board } from './board.entity';

@Entity('lists')
export class List {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty()
  @Index('idx_lists_board_id')
  @Column({ type: 'bigint' })
  board_id!: string;

  @ManyToOne(() => Board, (b) => b.lists, { onDelete: 'CASCADE' })
  // board join column is board_id
  board?: Board;

  @ApiProperty()
  @Column({ type: 'text' })
  title!: string;

  @ApiProperty()
  @Column({ type: 'text' })
  name!: string;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_lists_board_pos')
  @Column({ type: 'bigint', default: 0 })
  position!: string;
}
