import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { BoardMember } from '../../boards/entities/board-member.entity';
import { CardMember } from '../../cards/entities/card-member.entity';
import { Card } from '../../cards/entities/card.entity';
import { Attachment } from '../../cards/entities/attachment.entity';
import { Comment } from '../../cards/entities/comment.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Auto-increment id' })
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ApiProperty({ example: 'john@example.com', description: 'Email duy nhất của user' })
  @Column({ unique: true, type: 'citext' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Tên người dùng' })
  @Column({ type: 'text' })
  name!: string;

  @ApiProperty({ example: 'hashed-password', description: 'Mật khẩu (đã hash)' })
  @Column({ type: 'text' })
  password!: string;

  @ApiProperty({ example: 'https://...', description: 'URL avatar' })
  @Column({ type: 'text', nullable: true })
  avatar_url?: string;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @ApiProperty({ example: false, description: 'Email đã được xác thực' })
  @Column({ type: 'boolean', default: false })
  is_email_verified!: boolean;

  @ApiProperty({ example: ['user'], description: 'Vai trò của user' })
  @Column({ type: 'text', array: true, default: ['user'] })
  roles!: string[];

  @Column({ type: 'text', nullable: true })
  verification_token?: string;

  @Column({ type: 'timestamptz', nullable: true })
  verification_token_expires?: Date;

  @Column({ type: 'text', nullable: true })
  reset_password_token?: string;

  @Column({ type: 'timestamptz', nullable: true })
  reset_password_token_expires?: Date;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian tạo' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-09-22T12:00:00.000Z', description: 'Thời gian cập nhật cuối cùng' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => WorkspaceMember, (wm) => wm.user)
  workspaceMembers?: WorkspaceMember[];

  @OneToMany(() => BoardMember, (bm) => bm.user)
  boardMembers?: BoardMember[];

  @OneToMany(() => CardMember, (cm) => cm.user)
  cardMembers?: CardMember[];

  @OneToMany(() => Card, (c) => c.created_by_user)
  cardsCreated?: Card[];

  @OneToMany(() => Attachment, (a) => a.uploader)
  attachments?: Attachment[];

  @OneToMany(() => Comment, (co) => co.author)
  comments?: Comment[];
}
