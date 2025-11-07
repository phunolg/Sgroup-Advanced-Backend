import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BoardsController } from './controllers/boards.controller';
import { BoardsService } from './services/boards.service';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';
import { List } from './entities/list.entity';
import { Label } from './entities/label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember, List, Label]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
