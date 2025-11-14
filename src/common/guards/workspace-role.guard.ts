import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy các vai trò được phép từ decorator
    const allowedRoles: string[] =
      this.reflector.getAllAndOverride<string[]>(WORKSPACE_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not authenticated');

    // nếu là admin thì cho qua
    if (Array.isArray(user.roles) && user.roles.includes('admin')) return true;

    const workspaceId =
      req.params?.workspaceId ?? req.params?.id ?? req.body?.workspaceId ?? req.query?.workspaceId;
    if (!workspaceId) throw new UnauthorizedException('Workspace ID not provided');

    const userId = Number(user.sub ?? user.id ?? user);
    const repo = this.dataSource.getRepository(WorkspaceMember);
    const membership = await repo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership) throw new UnauthorizedException('User is not a member of the workspace');
    if (!allowedRoles.includes(membership.role))
      throw new ForbiddenException('Insufficient workspace role');

    return true;
  }
}
