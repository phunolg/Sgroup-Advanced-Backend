import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
@Index('idx_comments_card_created', ['card_id', 'created_at'])
export class Comment {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  card_id!: string;

  @ManyToOne(() => Card, (c) => c, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card?: Card;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  author_id?: string;

  @ManyToOne(() => User, (u) => u.comments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author?: User;

  @ApiProperty()
  @Column({ type: 'text' })
  body!: string;

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  parent_id?: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at!: Date;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  edited_at?: Date;
}
