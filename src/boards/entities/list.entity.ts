import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Board } from './board.entity';

@Entity('lists')
export class List {
  @ApiProperty({ example: '91bbf2a1-8d84-42d0-9d5f-c7850d2feadc' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Index('idx_lists_board_id')
  @Column({ type: 'uuid' })
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
  @Column({ type: 'boolean', default: false })
  archived!: boolean;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_lists_board_pos')
  @Column({ type: 'bigint', default: 0 })
  position!: string;
}
