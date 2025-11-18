import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
export class WorkspaceMember {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  workspace_id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @PrimaryColumn({ type: 'uuid' })
  @Index('idx_workspace_members_user')
  user_id!: string;

  @ApiProperty({ example: 'member' })
  @Column({ type: 'text' })
  role!: 'owner' | 'admin' | 'member';

  @ApiProperty({ example: 'pending' })
  @Column({ type: 'text', default: 'pending' })
  status!: 'pending' | 'accepted' | 'declined';

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  joined_at!: Date;

  @ManyToOne(() => User, (u) => u.workspaceMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Workspace, (w) => w, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;
}
