import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesController } from './controllers/workspaces.controller';
import { WorkspacesService } from './services/workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { MailModule } from 'src/mail/mail.module';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/common/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember]),
    MailModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceRoleGuard],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
