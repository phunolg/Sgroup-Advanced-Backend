import { SetMetadata } from '@nestjs/common';
import { BoardPermission } from '../enum/permission/board-permissions.enum';

export const BOARD_PERMISSION_KEY = 'board_permission';
export const RequireBoardPermissions = (...permission: BoardPermission[]) =>
  SetMetadata(BOARD_PERMISSION_KEY, permission);
