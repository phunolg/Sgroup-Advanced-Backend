import {
  Controller,
  Get,
  Param,
  Body,
  Delete,
  ValidationPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto, CurrentUserResponseDto } from '../dto';
import { UpdateUserResponseDto } from '../dto/update-user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    type: CurrentUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: any): Promise<CurrentUserResponseDto> {
    return this.usersService.findById(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    console.log('Looking for user with ID:', id, 'Type:', typeof id);
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'User updated', type: UpdateUserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserById(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserById(@Param('id') id: string) {
    return this.usersService.deleteById(id);
  }
}
