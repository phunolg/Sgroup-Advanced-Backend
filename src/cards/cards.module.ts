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
import { List } from '../boards/entities/list.entity';
import { CardPermissionGuard } from '../common/guards/card-permission.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      Attachment,
      Comment,
      Checklist,
      ChecklistItem,
      CardLabel,
      List,
    ]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CardsController],
  providers: [CardsService, CardPermissionGuard],
  exports: [CardsService],
})
export class CardsModule {}
