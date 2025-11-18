import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from './card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('attachments')
export class Attachment {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty()
  @ApiProperty()
  @Index('idx_attachments_card')
  @Column({ type: 'bigint' })
  card_id!: string;

  @ManyToOne(() => Card, (c) => c.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card?: Card;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  uploader_id?: string;

  @ManyToOne(() => User, (u) => u.attachments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploader_id' })
  uploader?: User;

  @ApiProperty()
  @Column({ type: 'text' })
  file_name!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  mime_type?: string;

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  size_bytes?: string;

  @ApiProperty()
  @Column({ type: 'text' })
  url!: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at!: Date;
}
