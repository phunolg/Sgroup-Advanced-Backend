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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CardsService } from '../services/cards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CardPermissionGuard } from '../../common/guards/card-permission.guard';
import {
  CreateCardDto,
  UpdateCardDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  AddLabelToCardDto,
} from '../dto';
import { UpdateCardDueDateDto } from '../dto/update-card-due-date.dto';
import { BoardPermissionGuard } from 'src/common/guards/board-permission.guard';
import { BoardRole } from 'src/common/enum/role/board-role.enum';
import { BoardRoles } from 'src/common/decorators/board-roles.decorator';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CardPermissionGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // ============ Cards CRUD ============
  @Post()
  @ApiOperation({ summary: 'Create a new card' })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createCardDto: CreateCardDto,
    @Request() req: any,
  ) {
    return this.cardsService.create(createCardDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cards (optional: filter by list)' })
  @ApiQuery({ name: 'listId', required: false, description: 'Filter by list ID' })
  @ApiQuery({
    name: 'archived',
    required: false,
    description: 'Filter by archived status (true/false)',
  })
  @ApiResponse({ status: 200, description: 'List of cards' })
  async findAll(@Query('listId') listId?: string, @Query('archived') archived?: string) {
    const archivedBool = archived === 'true' ? true : archived === 'false' ? false : undefined;
    return this.cardsService.findAll(listId, archivedBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card details' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card updated' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 204, description: 'Card deleted' })
  async remove(@Param('id') id: string) {
    await this.cardsService.remove(id);
  }

  // ============ Card Due Date ============
  @Patch(':cardId/due-date')
  @UseGuards(BoardPermissionGuard)
  @BoardRoles(BoardRole.MEMBER)
  @ApiBody({ type: UpdateCardDueDateDto, description: 'Update card due date and status' })
  @ApiOperation({ summary: 'Update card due date and status' })
  @ApiParam({ name: 'cardId', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card due date updated' })
  async updateCardDueDate(
    @Param('cardId') cardId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateCardDueDateDto,
  ) {
    return this.cardsService.updateCardDueDate(cardId, dto);
  }

  // Toggle Complete Card
  @Patch(':cardId/toggle-complete')
  @UseGuards(BoardPermissionGuard)
  @BoardRoles(BoardRole.MEMBER)
  @ApiOperation({ summary: 'Toggle complete card' })
  @ApiParam({ name: 'cardId', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card completed toggled' })
  async toggleCompleteCard(@Param('cardId') cardId: string) {
    return this.cardsService.toggleCompleteCard(cardId);
  }

  // ============ Archive/Unarchive ============
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card archived successfully' })
  async archive(@Param('id') id: string) {
    return this.cardsService.archiveCard(id, true);
  }

  @Delete(':id/archive')
  @ApiOperation({ summary: 'Unarchive a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'Card unarchived successfully' })
  async unarchive(@Param('id') id: string) {
    return this.cardsService.archiveCard(id, false);
  }

  // ============ Comments ============
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get all comments for a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async getCardComments(@Param('id') id: string) {
    return this.cardsService.getCardComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  async createComment(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.cardsService.createComment(id, dto, req.user.sub);
  }

  @Patch(':id/comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated' })
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateCommentDto,
    @Request() req: any,
  ) {
    return this.cardsService.updateComment(id, commentId, dto, req.user.sub);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  async removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    await this.cardsService.removeComment(id, commentId, req.user.sub);
  }

  // ============ Checklists ============
  @Get(':id/checklists')
  @ApiOperation({ summary: 'Get all checklists for a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 200, description: 'List of checklists' })
  async getCardChecklists(@Param('id') id: string) {
    return this.cardsService.getCardChecklists(id);
  }

  @Post(':id/checklists')
  @ApiOperation({ summary: 'Create a checklist in a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 201, description: 'Checklist created' })
  async createChecklist(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateChecklistDto,
  ) {
    return this.cardsService.createChecklist(id, dto);
  }

  @Patch(':id/checklists/:checklistId')
  @ApiOperation({ summary: 'Update a checklist' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'checklistId', description: 'Checklist ID' })
  @ApiResponse({ status: 200, description: 'Checklist updated' })
  async updateChecklist(
    @Param('id') id: string,
    @Param('checklistId') checklistId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateChecklistDto,
  ) {
    return this.cardsService.updateChecklist(id, checklistId, dto);
  }

  @Delete(':id/checklists/:checklistId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'checklistId', description: 'Checklist ID' })
  @ApiResponse({ status: 204, description: 'Checklist deleted' })
  async removeChecklist(@Param('id') id: string, @Param('checklistId') checklistId: string) {
    await this.cardsService.removeChecklist(id, checklistId);
  }

  // ============ Checklist Items ============
  @Post(':id/checklists/:checklistId/items')
  @ApiOperation({ summary: 'Add an item to a checklist' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'checklistId', description: 'Checklist ID' })
  @ApiResponse({ status: 201, description: 'Checklist item created' })
  async createChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateChecklistItemDto,
  ) {
    return this.cardsService.createChecklistItem(checklistId, dto);
  }

  @Patch(':id/checklists/:checklistId/items/:itemId')
  @ApiOperation({ summary: 'Update a checklist item' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'checklistId', description: 'Checklist ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Checklist item updated' })
  async updateChecklistItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateChecklistItemDto,
  ) {
    return this.cardsService.updateChecklistItem(checklistId, itemId, dto);
  }

  @Delete(':id/checklists/:checklistId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist item' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'checklistId', description: 'Checklist ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 204, description: 'Checklist item deleted' })
  async removeChecklistItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.cardsService.removeChecklistItem(checklistId, itemId);
  }

  // ============ Labels ============
  @Post(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a label to a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiResponse({ status: 204, description: 'Label added to card' })
  async addLabelToCard(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: AddLabelToCardDto,
  ) {
    await this.cardsService.addLabelToCard(id, dto);
  }

  @Delete(':id/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a label from a card' })
  @ApiParam({ name: 'id', description: 'Card ID' })
  @ApiParam({ name: 'labelId', description: 'Label ID' })
  @ApiResponse({ status: 204, description: 'Label removed from card' })
  async removeLabelFromCard(@Param('id') id: string, @Param('labelId') labelId: string) {
    await this.cardsService.removeLabelFromCard(id, labelId);
  }

  // ============ Move Card ============
  @Patch('move')
  @ApiOperation({ summary: 'Move card to another list or position (float position)' })
  @ApiResponse({ status: 200, description: 'Card moved successfully' })
  async moveCard(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: import('../dto').MoveCardDto,
    @Request() req: any,
  ) {
    return this.cardsService.moveCard(dto, req.user.sub);
  }
}
