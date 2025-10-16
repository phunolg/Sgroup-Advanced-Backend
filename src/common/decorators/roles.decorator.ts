import { SetMetadata } from '@nestjs/common';
import { Role } from '../roles.enum';

// SetMetadata('roles', roles) lưu mảng role vào metadata với key 'roles'.
// Khi guard chạy nó sẽ lấy metadata này để biết route yêu cầu gì.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
