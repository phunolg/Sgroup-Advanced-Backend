import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BoardsController } from './controllers/boards.controller';
import { BoardsService } from './services/boards.service';
import { CreateBoardGuard } from './guards/create-board.guard';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';
import { List } from './entities/list.entity';
import { Label } from './entities/label.entity';
import { BoardInvitation } from './entities/board-invitation.entity';
import { Card } from '../cards/entities/card.entity';

import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { User } from '../users/entities/user.entity';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { BoardPermissionGuard } from 'src/common/guards/board-permission.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      BoardMember,
      List,
      Label,
      BoardInvitation,
      WorkspaceMember,
      Workspace,
      User,
      Card,
    ]),
    JwtModule.register({}),
    ConfigModule,
    MailModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService, CreateBoardGuard, WorkspaceRoleGuard, BoardPermissionGuard],
  exports: [BoardsService],
})
export class BoardsModule {}
