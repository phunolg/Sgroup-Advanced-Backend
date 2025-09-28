import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './user.entity';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, description: 'OK', type: [User] })
  @Get()
  list(): Promise<User[]> {
    return this.users.findAll();
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'Created', type: User })
  @Post()
  create(@Body() dto: Partial<User>): Promise<User> {
    return this.users.create(dto);
  }
}
