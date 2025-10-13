import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityTimestamps } from '../../entities/base.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Board } from '../../boards/entities/board.entity';

@Entity('workspaces')
export class Workspace extends BaseEntityTimestamps {
  @ApiProperty({ example: '1' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ApiProperty({ example: 'Team A' })
  @Column({ type: 'text' })
  name!: string;

  @ApiProperty({ example: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @OneToMany(() => WorkspaceMember, (wm) => wm.workspace)
  members?: WorkspaceMember[];

  @OneToMany(() => Board, (b) => b)
  boards?: Board[];
}
