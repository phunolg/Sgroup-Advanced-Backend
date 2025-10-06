import { Entity, PrimaryColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { Label } from '../../boards/entities/label.entity';

@Entity('card_labels')
export class CardLabel {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  card_id!: string;

  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  @Index('idx_card_labels_label')
  label_id!: string;

  // Relations
  @ManyToOne(() => Card, (card) => card.cardLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card?: Card;

  @ManyToOne(() => Label, (label) => label.cardLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'label_id' })
  label?: Label;
}
