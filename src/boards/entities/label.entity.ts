import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Board } from './board.entity';
import { CardLabel } from '../../cards/entities/card-label.entity';

@Entity('labels')
export class Label {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_labels_board')
  @Column({ type: 'bigint' })
  board_id!: string;

  @ManyToOne(() => Board, (b) => b, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board?: Board;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  name?: string;

  @ApiProperty()
  @Column({ type: 'text' })
  color!: string;

  // OneToMany to join table
  @OneToMany(() => CardLabel, (cl) => cl.label)
  cardLabels?: CardLabel[];
}
