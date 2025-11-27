import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';

@Injectable()
export class CreateBoardGuard implements CanActivate {
  constructor(private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!body.workspace_id) {
      throw new ForbiddenException('Workspace ID is required');
    }

    const userId = user.sub; // UUID của user
    const workspaceId = body.workspace_id;

    const memberRepo = this.dataSource.getRepository(WorkspaceMember);
    const membership = await memberRepo.findOne({
      where: {
        workspace_id: String(workspaceId), // Convert to string để match entity
        user_id: userId,
        status: 'accepted',
      },
    });

    console.log('- membership found:', membership ? 'YES' : 'NO');
    if (membership) {
      console.log('- membership role:', membership.role);
      console.log('- membership status:', membership.status);
    }

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (membership.role === 'owner') {
      return true;
    }

    throw new ForbiddenException('Only workspace owners can create boards in this workspace');
  }
}
