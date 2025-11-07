import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BoardsService } from '../services/boards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateListDto,
  UpdateListDto,
  AddBoardMemberDto,
  UpdateBoardMemberDto,
  CreateLabelDto,
  UpdateLabelDto,
} from '../dto';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ============ Boards CRUD ============
  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, description: 'Board created successfully' })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createBoardDto: CreateBoardDto,
    @Request() req: any,
  ) {
    return this.boardsService.create(createBoardDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for current user' })
  @ApiResponse({ status: 200, description: 'List of boards' })
  async findAll(@Request() req: any) {
    return this.boardsService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board details' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board updated' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateBoardDto: UpdateBoardDto,
    @Request() req: any,
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 204, description: 'Board deleted' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.boardsService.remove(id, req.user.sub);
  }

  // ============ Board Members ============
  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of board members' })
  async getBoardMembers(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardMembers(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 201, description: 'Member added' })
  async addMember(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: AddBoardMemberDto,
    @Request() req: any,
  ) {
    return this.boardsService.addMember(id, dto, req.user.sub);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update board member role' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Member role updated' })
  async updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateBoardMemberDto,
    @Request() req: any,
  ) {
    return this.boardsService.updateMember(id, userId, dto, req.user.sub);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    await this.boardsService.removeMember(id, userId, req.user.sub);
  }

  // ============ Lists ============
  @Get(':id/lists')
  @ApiOperation({ summary: 'Get all lists in a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of lists' })
  async getBoardLists(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardLists(id, req.user.sub);
  }

  @Post(':id/lists')
  @ApiOperation({ summary: 'Create a list in board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 201, description: 'List created' })
  async createList(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateListDto,
    @Request() req: any,
  ) {
    return this.boardsService.createList(id, dto, req.user.sub);
  }

  @Patch(':id/lists/:listId')
  @ApiOperation({ summary: 'Update a list' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, description: 'List updated' })
  async updateList(
    @Param('id') id: string,
    @Param('listId') listId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateListDto,
    @Request() req: any,
  ) {
    return this.boardsService.updateList(id, listId, dto, req.user.sub);
  }

  @Delete(':id/lists/:listId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a list' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 204, description: 'List deleted' })
  async removeList(@Param('id') id: string, @Param('listId') listId: string, @Request() req: any) {
    await this.boardsService.removeList(id, listId, req.user.sub);
  }

  // ============ Labels ============
  @Get(':id/labels')
  @ApiOperation({ summary: 'Get all labels in a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of labels' })
  async getBoardLabels(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardLabels(id, req.user.sub);
  }

  @Post(':id/labels')
  @ApiOperation({ summary: 'Create a label in board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 201, description: 'Label created' })
  async createLabel(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateLabelDto,
    @Request() req: any,
  ) {
    return this.boardsService.createLabel(id, dto, req.user.sub);
  }

  @Patch(':id/labels/:labelId')
  @ApiOperation({ summary: 'Update a label' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'labelId', description: 'Label ID' })
  @ApiResponse({ status: 200, description: 'Label updated' })
  async updateLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateLabelDto,
    @Request() req: any,
  ) {
    return this.boardsService.updateLabel(id, labelId, dto, req.user.sub);
  }

  @Delete(':id/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'labelId', description: 'Label ID' })
  @ApiResponse({ status: 204, description: 'Label deleted' })
  async removeLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @Request() req: any,
  ) {
    await this.boardsService.removeLabel(id, labelId, req.user.sub);
  }
}
