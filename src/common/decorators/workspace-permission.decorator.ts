import { SetMetadata } from '@nestjs/common';
import { WorkspacePermission } from '../enum/permission/workspace-permissions.enum';

export const WORKSPACE_PERMISSION_KEY = 'workspace_permission';
export const RequireWorkspacePermissions = (...permission: WorkspacePermission[]) =>
  SetMetadata(WORKSPACE_PERMISSION_KEY, permission);
