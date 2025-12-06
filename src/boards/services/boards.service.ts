import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Board, BoardVisibility } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';
import { List } from '../entities/list.entity';
import { Label } from '../entities/label.entity';
import { BoardInvitation } from '../entities/board-invitation.entity';

import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { User } from '../../users/entities/user.entity';

import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateListDto,
  UpdateListDto,
  AddBoardMemberDto,
  UpdateBoardMemberDto,
  CreateLabelDto,
  UpdateLabelDto,
  CreateBoardInvitationDto,
} from '../dto';
import { BoardRole } from 'src/common/enum/role/board-role.enum';
import { MailService } from '../../mail/mail.service';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../common/redis.module';

// dữ liệu lưu trong Redis cho email invitation token
interface InvitationCachePayload {
  invitationId: string;
  boardId: string;
  invitedEmail?: string;
  invitedUserId?: string;
  createdBy: string;
  boardName: string;
  inviterName: string;
  expiresAt: string;
}

export interface InvitationVerificationResult {
  invitationId: string;
  boardId: string;
  boardName: string;
  inviterName: string;
  invitedEmail?: string;
  invitedUserId?: string;
  expiresAt: string;
}

@Injectable()
export class BoardsService {
  private static readonly INVITE_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BoardInvitation)
    private readonly boardInvitationRepository: Repository<BoardInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  // Boards CRUD
  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardRepository.create({
      ...createBoardDto,
      workspace_id: createBoardDto.workspaceId,
      created_by: userId,
      invite_link_token: this.generateToken(),
    });
    const savedBoard = await this.boardRepository.save(board);

    // tự động thêm người tạo làm owner của board
    await this.boardMemberRepository.save({
      board_id: savedBoard.id,
      user_id: userId,
      role: BoardRole.OWNER,
    });

    return savedBoard;
  }

  async findAll(userId: string, isClosed: boolean = false, workspaceId?: string): Promise<Board[]> {
    const query = this.boardRepository
      .createQueryBuilder('board')
      // 1. Join với bảng board_members: check quyen
      .leftJoin('board.members', 'bm', 'bm.user_id = :userId', { userId })

      // 2. Join với workspace -> workspace_members: check quyen
      .leftJoin('board.workspace', 'w')
      .leftJoin('w.members', 'wm', 'wm.user_id = :userId', { userId })

      // 3. Logic lọc điều kiện OR
      .where(
        new Brackets((qb) => {
          // Điều kiện A: User là thành viên Board
          qb.where('bm.user_id IS NOT NULL')

            // Điều kiện B: Board Public VÀ User thuộc Workspace
            // Truyền biến publicStatus NGAY TẠI ĐÂY
            .orWhere('(board.visibility = :publicStatus AND wm.user_id IS NOT NULL)', {
              publicStatus: BoardVisibility.PUBLIC,
            });
        }),
      )

      // 4. Lọc board chưa đóng
      .andWhere('board.is_closed = :status', { status: isClosed });
    if (workspaceId) {
      // Nếu có gửi ID thì lọc, không thì thôi
      query.andWhere('board.workspace_id = :workspaceId', { workspaceId });
    }
    return query.orderBy('board.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, userId: string): Promise<Board> {
    await this.checkBoardAccess(id, userId);
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<Board> {
    await this.checkBoardAccess(id, userId, BoardRole.OWNER);
    await this.boardRepository.update(id, updateBoardDto);
    const updatedBoard = await this.boardRepository.findOne({
      where: { id },
    });
    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return updatedBoard;
  }

  async updateVisibility(
    userId: string,
    boardId: string,
    visibility: BoardVisibility,
  ): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }
    await this.boardRepository.update(boardId, { visibility });
    return { ...board, visibility };
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.checkBoardAccess(id, userId, BoardRole.OWNER);
    await this.boardRepository.delete(id);
  }

  // Board Members
  async addMember(boardId: string, dto: AddBoardMemberDto, userId: string): Promise<BoardMember> {
    await this.checkBoardAccess(boardId, userId, BoardRole.OWNER);
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
    await this.checkBoardAccess(boardId, userId, BoardRole.OWNER);
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
    await this.checkBoardAccess(boardId, userId, BoardRole.OWNER);
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

  private async checkBoardAccess(
    boardId: string,
    userId: string,
    requiredRole?: BoardRole,
  ): Promise<void> {
    const member = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: userId },
    });

    if (!member) {
      throw new ForbiddenException('You do not have access to this board');
    }
    if (requiredRole === BoardRole.OWNER && member.role !== BoardRole.OWNER) {
      throw new ForbiddenException('Owner access required');
    }
  }

  // change owner board
  async changeBoardOwner(
    boardId: string,
    newOwnerId: string,
    currentOwnerId: string,
  ): Promise<{ message: string; success: boolean }> {
    // ensure new owner is a member of the board
    const newOwner = await this.boardMemberRepository.findOne({
      where: { board_id: boardId, user_id: newOwnerId },
    });
    if (!newOwner) throw new NotFoundException('New owner must be a member of the board');

    // ensure new owner is not already the owner
    if (newOwner.role === 'owner') throw new ForbiddenException('User is already the owner');

    if (currentOwnerId === newOwnerId) {
      throw new ForbiddenException('You are already the owner of this board');
    }

    // update roles
    await this.boardMemberRepository.update(
      { board_id: boardId, user_id: newOwnerId },
      { role: BoardRole.OWNER },
    );
    await this.boardMemberRepository.update(
      { board_id: boardId, user_id: currentOwnerId },
      { role: BoardRole.MEMBER },
    );

    return { message: 'Board owner changed successfully', success: true };
  }

  //Check quyen owner
  private async checkOwnerAccess(userId: string, board: Board): Promise<void> {
    let hasPermission = board.created_by === userId;
    if (!hasPermission && board.workspace_id) {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { workspace_id: board.workspace_id, user_id: userId },
      });
      if (workspaceMember && workspaceMember.role === 'owner') {
        hasPermission = true;
      }
    }
    if (!hasPermission) {
      throw new ForbiddenException('Only Board Owner or Workspce Owner can perform');
    }
  }

  //Archive/ Reopen board
  async archiveBoard(userId: string, boardId: string, isClosed: boolean): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(`Board not found`);

    await this.checkOwnerAccess(userId, board);

    board.is_closed = isClosed;
    return this.boardRepository.save(board);
  }

  //delete Permanetly
  async deleteBoardPermanent(useId: string, boardId: string): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(`Board not found`);
    await this.checkOwnerAccess(useId, board);
    await this.boardRepository.delete(boardId);
  }

  // Invitation methods
  async createInvitation(
    boardId: string,
    userId: string,
    dto: CreateBoardInvitationDto,
  ): Promise<{ token: string; link: string; expires_at: Date }> {
    // giữ checkBoardAccess phòng khi service được gọi ngoài controller
    await this.checkBoardAccess(boardId, userId);

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Gen token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const invitation = this.boardInvitationRepository.create({
      board_id: boardId,
      created_by: userId,
      invited_email: dto.invited_email,
      invited_user_id: dto.invited_user_id,
      expires_at: expiresAt,
    });

    const [savedInvitation, inviter] = await Promise.all([
      this.boardInvitationRepository.save(invitation),
      this.userRepository.findOne({
        where: { id: userId },
      }),
    ]);
    const inviterName = inviter?.name || 'A user';

    const payload: InvitationCachePayload = {
      invitationId: savedInvitation.id,
      boardId,
      invitedEmail: dto.invited_email,
      invitedUserId: dto.invited_user_id,
      createdBy: userId,
      boardName: board.name,
      inviterName,
      expiresAt: expiresAt.toISOString(),
    };

    // lưu payload vào Redis, không còn lưu token trong DB
    await this.redisClient.set(
      this.getInvitationRedisKey(token),
      JSON.stringify(payload),
      'EX',
      BoardsService.INVITE_TOKEN_TTL_SECONDS,
    );
    const invitationLink = `${this.getAppUrl()}/boards/invitations/${token}/verify`;

    // gửi email mời nếu có cung cấp email
    if (dto.invited_email) {
      this.mailService.sendBoardInvitation({
        board_name: board.name,
        invited_email: dto.invited_email,
        inviter_name: inviterName,
        invitation_link: invitationLink,
      });
    }

    return {
      token,
      link: invitationLink,
      expires_at: expiresAt,
    };
  }

  async verifyInvitation(token: string): Promise<InvitationVerificationResult> {
    const redisKey = this.getInvitationRedisKey(token);
    const cachedPayload = await this.redisClient.get(redisKey);

    if (!cachedPayload) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    // parse JSON string thành object
    let payload: InvitationCachePayload;
    try {
      payload = JSON.parse(cachedPayload) as InvitationCachePayload;
    } catch (error) {
      await this.redisClient.del(redisKey);
      throw new NotFoundException('Invalid or expired invitation');
    }

    return {
      invitationId: payload.invitationId,
      boardId: payload.boardId,
      boardName: payload.boardName,
      inviterName: payload.inviterName,
      invitedEmail: payload.invitedEmail,
      invitedUserId: payload.invitedUserId,
      expiresAt: payload.expiresAt,
    };
  }

  async acceptInvitation(token: string, userId: string): Promise<Board> {
    const redisKey = this.getInvitationRedisKey(token);
    const invitation = await this.verifyInvitation(token);

    const invitationRecord = await this.boardInvitationRepository.findOne({
      where: { id: invitation.invitationId },
    });

    if (!invitationRecord) {
      await this.redisClient.del(redisKey);
      throw new NotFoundException('Invalid or expired invitation');
    }

    if (invitationRecord.is_used || invitationRecord.isExpired()) {
      await this.redisClient.del(redisKey);
      throw new NotFoundException('Invalid or expired invitation');
    }

    // Check if user is already a member
    const existingMember = await this.boardMemberRepository.findOne({
      where: { board_id: invitation.boardId, user_id: userId },
    });

    // If not a member yet, add them as board member
    if (!existingMember) {
      await this.boardMemberRepository.save({
        board_id: invitation.boardId,
        user_id: userId,
        role: BoardRole.MEMBER,
      });
    }

    // Mark invitation as used
    await this.boardInvitationRepository.update(
      { id: invitation.invitationId },
      { is_used: true, used_by: userId },
    );

    await this.redisClient.del(redisKey);

    const board = await this.boardRepository.findOne({
      where: { id: invitation.boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async joinBoardByInviteLink(token: string, userId: string): Promise<Board> {
    // tìm board theo token đã lưu trong db
    const board = await this.boardRepository.findOne({
      where: { invite_link_token: token },
    });

    if (!board) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    if (board.workspace_id) {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { workspace_id: board.workspace_id, user_id: userId },
      });

      if (!workspaceMember) {
        throw new ForbiddenException('You must be a member of the workspace to join this board');
      }
    }

    const existingMember = await this.boardMemberRepository.findOne({
      where: { board_id: board.id, user_id: userId },
    });

    if (existingMember) {
      throw new ForbiddenException('You are already a member of this board');
    }

    await this.boardMemberRepository.save({
      board_id: board.id,
      user_id: userId,
      role: BoardRole.MEMBER,
    });

    return board;
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  // tạo key
  private getInvitationRedisKey(token: string): string {
    return `board:invite:${token}`;
  }

  private getAppUrl(): string {
    return process.env.APP_URL || 'http://localhost:5000';
  }
}
