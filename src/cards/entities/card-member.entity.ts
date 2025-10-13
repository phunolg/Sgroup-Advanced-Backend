import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Card } from './card.entity';

@Entity('card_members')
export class CardMember {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  card_id!: string;

  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  @Index('idx_card_members_user')
  user_id!: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  assigned_at!: Date;

  @ManyToOne(() => Card, (c) => c, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card?: Card;

  @ManyToOne(() => User, (u) => u.cardMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
