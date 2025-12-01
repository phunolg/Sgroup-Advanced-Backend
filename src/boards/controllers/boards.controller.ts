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
  UpdateBoardVisibilityDto,
  CreateBoardInvitationDto,
} from '../dto';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { WorkspaceRoles } from 'src/common/decorators/workspace-roles.decorator';
import { RequireWorkspacePermissions } from 'src/common/decorators/workspace-permission.decorator';
import { WorkspacePermission } from 'src/common/enum/permission/workspace-permissions.enum';
import { BoardPermissionGuard } from 'src/common/guards/board-permission.guard';
import { BoardRole } from 'src/common/enum/role/board-role.enum';
import { BoardRoles } from 'src/common/decorators/board-roles.decorator';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ============ Boards CRUD ============
  @Post()
  // @UseGuards(CreateBoardGuard)
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('owner', 'member')
  @RequireWorkspacePermissions(WorkspacePermission.CREATE_BOARD)
  @ApiOperation({ summary: 'Create a new board (workspace owner only)' })
  @ApiResponse({ status: 201, description: 'Board created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only workspace owners can create boards' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
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
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board details' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(BoardPermissionGuard)
  @BoardRoles(BoardRole.OWNER)
  @ApiOperation({ summary: 'Update a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Board updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - only board owners can edit' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateBoardDto: UpdateBoardDto,
    @Request() req: any,
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.sub);
  }

  @Patch(':id/visibility')
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Update board visibility (Public/Private)' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Visibility updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only Board Owner or Workspace Owner can perform this action',
  })
  async updateVisibility(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateBoardVisibilityDto,
    @Request() req: any,
  ) {
    return this.boardsService.updateVisibility(req.user.sub, id, dto.visibility);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Delete a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 204, description: 'Board deleted' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.boardsService.remove(id, req.user.sub);
  }

  // ============ Board Members ============
  @Get(':id/members')
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Get all members of a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of board members' })
  async getBoardMembers(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardMembers(id, req.user.sub);
  }

  @Post(':id/members')
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
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

  // change owner board
  @ApiOperation({ summary: 'Change board owner' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'newOwnerId', description: 'New Owner User ID' })
  @ApiResponse({ status: 200, description: 'Board owner changed' })
  @UseGuards(BoardPermissionGuard)
  @BoardRoles(BoardRole.OWNER)
  @Patch(':boardId/change-owner')
  async changeBoardOwner(
    @Param('boardId') boardId: string,
    @Body('newOwnerId') newOwnerId: string,
    @Request() req: any,
  ) {
    return this.boardsService.changeBoardOwner(boardId, newOwnerId, req.user.sub);
  }

  // ============ Lists ============
  @Get(':id/lists')
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Get all lists in a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of lists' })
  async getBoardLists(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardLists(id, req.user.sub);
  }

  @Post(':id/lists')
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Delete a list' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 204, description: 'List deleted' })
  async removeList(@Param('id') id: string, @Param('listId') listId: string, @Request() req: any) {
    await this.boardsService.removeList(id, listId, req.user.sub);
  }

  // ============ Labels ============
  @Get(':id/labels')
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Get all labels in a board' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'List of labels' })
  async getBoardLabels(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.getBoardLabels(id, req.user.sub);
  }

  @Post(':id/labels')
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
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
  @UseGuards(BoardPermissionGuard)
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

  // ============ Board Invitations ============
  @Post(':id/invitations')
  @UseGuards(BoardPermissionGuard)
  @ApiOperation({ summary: 'Create board invitation (member or owner only)' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  async createInvitation(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateBoardInvitationDto,
    @Request() req: any,
  ) {
    return this.boardsService.createInvitation(id, req.user.sub, dto);
  }

  // ============ Join Board via Invite Link ============
  @Get('invite/:token')
  @ApiOperation({ summary: 'Join board via permanent invite link' })
  @ApiParam({ name: 'token', description: 'Permanent board invite token' })
  @ApiResponse({ status: 200, description: 'Successfully joined board via permanent link' })
  async joinBoardViaLink(@Param('token') token: string, @Request() req: any) {
    return this.boardsService.joinBoardByInviteLink(token, req.user.sub);
  }

  // ============ Accept Board Invitation ============
  @Get('invitations/:token/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify invitation token (public)' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation verified' })
  async verifyInvitation(@Param('token') token: string) {
    return this.boardsService.verifyInvitation(token);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept invitation and join board' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation accepted, user joined board' })
  async acceptInvitation(@Param('token') token: string, @Request() req: any) {
    return this.boardsService.acceptInvitation(token, req.user.sub);
  }
}
