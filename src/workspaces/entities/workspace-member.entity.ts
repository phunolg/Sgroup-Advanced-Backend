import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
export class WorkspaceMember {
  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  workspace_id!: string;

  @ApiProperty({ example: '1' })
  @PrimaryColumn({ type: 'bigint' })
  @Index('idx_workspace_members_user')
  user_id!: string;

  @ApiProperty({ example: 'member' })
  @Column({ type: 'text' })
  role!: 'owner' | 'admin' | 'member';

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
