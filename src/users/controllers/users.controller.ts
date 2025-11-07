import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user from JWT' })
  @ApiResponse({ status: 200, description: 'Current user payload' })
  getMe(@Req() req: any) {
    const user = req.user || {};
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }
}
