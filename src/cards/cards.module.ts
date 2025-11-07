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

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Attachment, Comment, Checklist, ChecklistItem, CardLabel]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
