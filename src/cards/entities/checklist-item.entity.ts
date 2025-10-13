import { Column, Entity, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Checklist } from './checklist.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_items_checklist_pos')
  @Column({ type: 'bigint' })
  checklist_id!: string;

  @ManyToOne(() => Checklist, (checklist) => checklist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_id' })
  checklist?: Checklist;

  @ApiProperty()
  @Column({ type: 'text' })
  content!: string;

  @ApiProperty()
  @ApiProperty()
  @Column({ type: 'bigint', default: 0 })
  position!: string;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_items_checked')
  @Column({ type: 'boolean', default: false })
  is_checked!: boolean;

  @ApiProperty()
  @Index('idx_items_due')
  @Column({ type: 'timestamptz', nullable: true })
  due_at?: Date;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  completed_at?: Date;
}
