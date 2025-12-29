import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CardsController } from './controllers/cards.controller';
import { CardsService } from './services/cards.service';
import { Card } from './entities/card.entity';
import { Attachment } from './entities/attachment.entity';
import { Comment } from './entities/comment.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { CardLabel } from './entities/card-label.entity';
import { CardMember } from './entities/card-member.entity';
import { List } from '../boards/entities/list.entity';
import { Label } from '../boards/entities/label.entity';
import { BoardMember } from '../boards/entities/board-member.entity';
import { CardPermissionGuard } from '../common/guards/card-permission.guard';
import { BoardPermissionGuard } from 'src/common/guards/board-permission.guard';
import { Board } from 'src/boards/entities/board.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      Attachment,
      Comment,
      Checklist,
      ChecklistItem,
      CardLabel,
      CardMember,
      Label,
      Workspace,
      List,
      Board,
      BoardMember,
    ]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CardsController],
  providers: [CardsService, CardPermissionGuard, BoardPermissionGuard],
  exports: [CardsService],
})
export class CardsModule {}
