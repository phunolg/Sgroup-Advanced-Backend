import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { User } from '../../users/entities/user.entity';

@Entity('board_invitations')
export class BoardInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  board_id!: string;

  @ManyToOne(() => Board, (board) => board.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @Column('uuid')
  created_by!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  inviter!: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invited_email?: string; // email của người được mời (nếu chưa có account)

  @Column('uuid', { nullable: true })
  invited_user_id?: string; // user_id nếu đã có account

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser?: User;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string; // Unique invitation token

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ type: 'boolean', default: false })
  is_used!: boolean;

  @Column('uuid', { nullable: true })
  used_by?: string; // user_id của người accepted invitation

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Helper method to check if invitation is expired
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  // Helper method to check if invitation is still valid
  isValid(): boolean {
    return !this.is_used && !this.isExpired();
  }
}
