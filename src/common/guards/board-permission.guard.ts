import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardMember } from 'src/boards/entities/board-member.entity';
import { Board } from 'src/boards/entities/board.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { Card } from 'src/cards/entities/card.entity';
import { DataSource } from 'typeorm';
import { BOARD_ROLES_KEY } from '../decorators/board-roles.decorator';
import { BOARD_PERMISSION_KEY } from '../decorators/board-permissions.decorator';

@Injectable()
export class BoardPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not authenticated');

    // Bypass for admin
    if (user.roles?.includes('admin')) return true;

    let boardId = req.params.boardId || req.body?.boardId || req.query?.boardId;

    // Nếu không có boardId nhưng có cardId trong route /cards/, lấy boardId từ card
    if (!boardId && req.params.cardId && req.path.includes('/cards/')) {
      const cardRepo = this.dataSource.getRepository(Card);
      const card = await cardRepo.findOne({
        where: { id: req.params.cardId },
        select: ['board_id'],
      });

      if (!card) {
        throw new NotFoundException('Card not found');
      }

      boardId = card.board_id;
    }

    // ✅ Nếu vẫn không có boardId, lấy từ params.id (cho routes boards)
    if (!boardId && req.params.id && !req.path.includes('/cards/')) {
      boardId = req.params.id;
    }

    if (!boardId) throw new UnauthorizedException('Board ID is required');

    const userId = user.sub ?? user.id ?? user;

    // Get board information
    const boardRepo = this.dataSource.getRepository(Board);
    const board = await boardRepo.findOne({ where: { id: boardId } });

    if (!board) throw new NotFoundException('Board not found');

    const workspaceId = board.workspace_id;

    // Check workspace owner
    const workspaceMemberRepo = this.dataSource.getRepository(WorkspaceMember);
    const workspaceMember = await workspaceMemberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    // If user is workspace owner, allow all permissions
    if (workspaceMember && workspaceMember.role === 'owner') {
      return true;
    }

    // Get board member information
    const boardMemberRepo = this.dataSource.getRepository(BoardMember);
    const boardMember = await boardMemberRepo.findOne({
      where: { board_id: boardId, user_id: userId },
    });

    // If user is not board member -> block
    if (!boardMember) {
      throw new ForbiddenException('You are not a member of this board');
    }

    // Check permission in the board
    const allowedRoles =
      this.reflector.getAllAndOverride<string[]>(BOARD_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(BOARD_PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (boardMember.role === 'owner') {
      return true;
    }

    // Check role
    if (allowedRoles.length > 0) {
      if (!allowedRoles.includes(boardMember.role)) {
        throw new ForbiddenException('Insufficient board role');
      }
    }

    // Check permission
    if (requiredPermissions.length > 0) {
      const userPermissions = boardMember.permissions || [];
      const hasAllPermissions = requiredPermissions.every((p) =>
        userPermissions.includes(p as any),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Missing required board permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
