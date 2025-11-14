import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (number)', type: 'integer' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    console.log('Looking for user with ID:', id, 'Type:', typeof id);
    return this.usersService.findById(id);
  }
}
