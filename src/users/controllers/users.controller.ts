import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Body,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto';
import { UpdateUserResponseDto } from '../dto/update-user-response.dto';

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

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (number)', type: 'integer' })
  @ApiResponse({ status: 200, description: 'User updated', type: UpdateUserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (number)', type: 'integer' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteById(id);
  }
}
