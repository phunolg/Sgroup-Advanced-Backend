import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { BOARD_ROLES_KEY } from '../decorators/board-roles.decorator';
import { BOARD_PERMISSION_KEY } from '../decorators/board-permissions.decorator';
import { BoardMember } from '../../boards/entities/board-member.entity';
import { Board } from '../../boards/entities/board.entity';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { Card } from '../../cards/entities/card.entity';
import { List } from '../../boards/entities/list.entity';

@Injectable()
export class CardPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.roles?.includes('admin')) {
      return true;
    }

    const userId = user.sub ?? user.id ?? user;
    const boardId = await this.resolveBoardId(req);
    if (!boardId) {
      throw new UnauthorizedException('Board ID is required');
    }

    const boardMemberRepo = this.dataSource.getRepository(BoardMember);
    const boardRepo = this.dataSource.getRepository(Board);
    const workspaceMemberRepo = this.dataSource.getRepository(WorkspaceMember);

    const boardMember = await boardMemberRepo.findOne({
      where: { board_id: boardId, user_id: userId },
      relations: ['board'],
    });

    let workspaceId = boardMember?.board?.workspace_id;
    if (!workspaceId) {
      const board = await boardRepo.findOne({ where: { id: boardId } });
      if (!board) {
        throw new NotFoundException('Board not found');
      }
      workspaceId = board.workspace_id;
    }

    const workspaceMember = await workspaceMemberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
    if (workspaceMember?.role === 'owner') {
      return true;
    }

    if (!boardMember) {
      throw new ForbiddenException('You are not a member of this board');
    }

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

    if (allowedRoles.length > 0 && !allowedRoles.includes(boardMember.role)) {
      throw new ForbiddenException('Insufficient board role');
    }

    if (requiredPermissions.length > 0) {
      const userPermissions = boardMember.permissions || [];
      const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm as any));
      if (!hasAll) {
        throw new ForbiddenException(
          `Missing required board permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }

  private async resolveBoardId(req: any): Promise<string | undefined> {
    const cardRepo = this.dataSource.getRepository(Card);
    const listRepo = this.dataSource.getRepository(List);

    const fromParams = req.params?.boardId || req.params?.board_id;
    if (fromParams) return fromParams;

    const cardId = req.params?.id || req.params?.cardId;
    if (cardId) {
      const card = await cardRepo.findOne({ where: { id: cardId }, select: ['board_id'] });
      if (card?.board_id) return card.board_id;
    }

    const listId = req.params?.listId || req.body?.list_id || req.query?.listId;
    if (listId) {
      const list = await listRepo.findOne({ where: { id: listId }, select: ['board_id'] });
      if (list?.board_id) return list.board_id;
    }

    return req.body?.board_id || req.query?.boardId;
  }
}
