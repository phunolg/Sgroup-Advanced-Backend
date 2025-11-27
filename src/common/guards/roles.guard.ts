import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enum/role/roles.enum';

// Guard: ApplicationUserRolesGuard — nơi quyết định cho phép hay chặn request
// Flow:
// 1. guard đọc metadata
// 2. nếu không có roles (route mở) thì cho qua
// 3. nếu có thì đọc request.user (phải có do auth chạy trước đó)
// 4. so sánh → nếu match thì cho qua, không thì ném ForbiddenException.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
