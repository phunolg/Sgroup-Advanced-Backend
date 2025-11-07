import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';
import { List } from '../entities/list.entity';
import { Label } from '../entities/label.entity';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateListDto,
  UpdateListDto,
  AddBoardMemberDto,
  UpdateBoardMemberDto,
  CreateLabelDto,
  UpdateLabelDto,
} from '../dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  // Boards CRUD
  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardRepository.create({
      ...createBoardDto,
      created_by: userId,
    });
    const savedBoard = await this.boardRepository.save(board);

    // Automatically add creator as admin member
    await this.boardMemberRepository.save({
      board_id: savedBoard.id,
      user_id: userId,
      role: 'admin',
    });

    return savedBoard;
  }

  async findAll(userId: string): Promise<Board[]> {
    // Find all boards where user is a member
    const members = await this.boardMemberRepository.find({
      where: { user_id: userId },
      relations: ['board'],
    });
    return members.map((m) => m.board!).filter(Boolean);
  }

  async findOne(id: string, userId: string): Promise<Board> {
    await this.checkBoardAccess(id, userId);
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'lists', 'workspace'],
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<Board> {
    await this.checkBoardAccess(id, userId, 'admin');
    await this.boardRepository.update(id, updateBoardDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.checkBoardAccess(id, userId, 'admin');
    await this.boardRepository.delete(id);
  }

  // Board Members
  async addMember(boardId: string, dto: AddBoardMemberDto, userId: string): Promise<BoardMember> {
    await this.checkBoardAccess(boardId, userId, 'admin');
    const member = this.boardMemberRepository.create({
      board_id: boardId,
      user_id: dto.user_id,
      role: dto.role,
    });
    return this.boardMemberRepository.save(member);
  }

  async updateMember(
    boardId: string,
    memberId: string,
    dto: UpdateBoardMemberDto,
    userId: string,
  ): Promise<BoardMember> {
    await this.checkBoardAccess(boardId, userId, 'admin');
    await this.boardMemberRepository.update(
      { board_id: boardId, user_id: memberId },
      { role: dto.role },
    );
    const updated = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: memberId },
      relations: ['user'],
    });
    if (!updated) {
      throw new NotFoundException('Member not found');
    }
    return updated;
  }

  async removeMember(boardId: string, memberId: string, userId: string): Promise<void> {
    await this.checkBoardAccess(boardId, userId, 'admin');
    await this.boardMemberRepository.delete({ board_id: boardId, user_id: memberId });
  }

  async getBoardMembers(boardId: string, userId: string): Promise<BoardMember[]> {
    await this.checkBoardAccess(boardId, userId);
    return this.boardMemberRepository.find({
      where: { board_id: boardId },
      relations: ['user'],
    });
  }

  // Lists
  async createList(boardId: string, dto: CreateListDto, userId: string): Promise<List> {
    await this.checkBoardAccess(boardId, userId);
    const maxPos = await this.listRepository
      .createQueryBuilder('list')
      .where('list.board_id = :boardId', { boardId })
      .select('MAX(list.position)', 'max')
      .getRawOne();
    const position = maxPos?.max ? (BigInt(maxPos.max) + BigInt(1)).toString() : '0';

    const list = this.listRepository.create({
      board_id: boardId,
      title: dto.title,
      name: dto.name,
      position,
    });
    return this.listRepository.save(list);
  }

  async updateList(
    boardId: string,
    listId: string,
    dto: UpdateListDto,
    userId: string,
  ): Promise<List> {
    await this.checkBoardAccess(boardId, userId);
    await this.listRepository.update({ id: listId, board_id: boardId }, dto);
    const updated = await this.listRepository.findOne({ where: { id: listId } });
    if (!updated) {
      throw new NotFoundException('List not found');
    }
    return updated;
  }

  async removeList(boardId: string, listId: string, userId: string): Promise<void> {
    await this.checkBoardAccess(boardId, userId);
    await this.listRepository.delete({ id: listId, board_id: boardId });
  }

  async getBoardLists(boardId: string, userId: string): Promise<List[]> {
    await this.checkBoardAccess(boardId, userId);
    return this.listRepository.find({
      where: { board_id: boardId },
      order: { position: 'ASC' },
    });
  }

  // Labels
  async createLabel(boardId: string, dto: CreateLabelDto, userId: string): Promise<Label> {
    await this.checkBoardAccess(boardId, userId);
    const label = this.labelRepository.create({
      board_id: boardId,
      name: dto.name,
      color: dto.color,
    });
    return this.labelRepository.save(label);
  }

  async updateLabel(
    boardId: string,
    labelId: string,
    dto: UpdateLabelDto,
    userId: string,
  ): Promise<Label> {
    await this.checkBoardAccess(boardId, userId);
    await this.labelRepository.update({ id: labelId, board_id: boardId }, dto);
    const updated = await this.labelRepository.findOne({ where: { id: labelId } });
    if (!updated) {
      throw new NotFoundException('Label not found');
    }
    return updated;
  }

  async removeLabel(boardId: string, labelId: string, userId: string): Promise<void> {
    await this.checkBoardAccess(boardId, userId);
    await this.labelRepository.delete({ id: labelId, board_id: boardId });
  }

  async getBoardLabels(boardId: string, userId: string): Promise<Label[]> {
    await this.checkBoardAccess(boardId, userId);
    return this.labelRepository.find({ where: { board_id: boardId } });
  }

  // Helper: Check board access
  private async checkBoardAccess(
    boardId: string,
    userId: string,
    requiredRole?: 'admin' | 'normal' | 'observer',
  ): Promise<void> {
    const member = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this board');
    }
    if (requiredRole === 'admin' && member.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }
}
