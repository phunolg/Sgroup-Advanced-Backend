import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Comment } from '../entities/comment.entity';
import { Checklist } from '../entities/checklist.entity';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { CardLabel } from '../entities/card-label.entity';
import { List } from '../../boards/entities/list.entity';
import { Attachment } from '../entities/attachment.entity';
import { Label } from '../../boards/entities/label.entity';
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

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(CardLabel)
    private readonly cardLabelRepository: Repository<CardLabel>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  // ============ Cards CRUD ============
  async create(createCardDto: CreateCardDto, userId: string): Promise<Card> {
    // Validate list exists and get board_id
    const list = await this.listRepository.findOne({
      where: { id: createCardDto.list_id },
      relations: ['board'],
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${createCardDto.list_id} not found`);
    }

    const position = createCardDto.position ?? (await this.getNextPosition(createCardDto.list_id));

    const card = this.cardRepository.create({
      ...createCardDto,
      board_id: list.board_id, // Auto-populate board_id from list
      position: Number(position),
      created_by: userId,
    });
    return this.cardRepository.save(card);
  }

  async findAll(listId?: string, archived?: boolean): Promise<Card[]> {
    const where: any = {};

    if (listId) {
      where.list_id = listId;
    }

    if (archived !== undefined) {
      where.archived = archived;
    }

    return this.cardRepository.find({
      where,
      order: { position: 'ASC' },
      relations: ['list', 'labels', 'checklists', 'created_by_user'],
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: [
        'list',
        'labels',
        'checklists',
        'checklists.items',
        'attachments',
        'created_by_user',
      ],
    });
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    // If list_id is being changed, update board_id accordingly
    let board_id = updateCardDto.board_id;

    if (updateCardDto.list_id) {
      const list = await this.listRepository.findOne({
        where: { id: updateCardDto.list_id },
      });

      if (!list) {
        throw new NotFoundException(`List with ID ${updateCardDto.list_id} not found`);
      }

      board_id = list.board_id; // Auto-update board_id when moving to different list
    }

    await this.cardRepository.update(id, {
      ...updateCardDto,
      board_id,
      position: updateCardDto.position !== undefined ? Number(updateCardDto.position) : undefined,
      updated_at: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.cardRepository.delete(id);
  }

  // ============ Archive/Unarchive ============
  async archiveCard(id: string, archived: boolean): Promise<Card> {
    const card = await this.findOne(id);
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return this.update(id, { archived });
  }

  // ============ Comments ============
  async createComment(cardId: string, dto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = this.commentRepository.create({
      card_id: cardId,
      author_id: userId,
      body: dto.body,
      parent_id: dto.parent_id,
    });
    const saved = await this.commentRepository.save(comment);

    await this.cardRepository.increment({ id: cardId }, 'comments_count', 1);

    return saved;
  }

  async updateComment(
    cardId: string,
    commentId: string,
    dto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, card_id: cardId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author_id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    await this.commentRepository.update(commentId, {
      body: dto.body,
      edited_at: new Date(),
    });
    const updated = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!updated) {
      throw new NotFoundException('Comment not found after update');
    }
    return updated;
  }

  async removeComment(cardId: string, commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, card_id: cardId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.commentRepository.delete(commentId);
    await this.cardRepository.decrement({ id: cardId }, 'comments_count', 1);
  }

  async getCardComments(cardId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { card_id: cardId },
      relations: ['author'],
      order: { created_at: 'ASC' },
    });
  }

  // ============ Card Due Date ============
  async updateCardDueDate(cardId: string, dto: UpdateCardDueDateDto): Promise<Card> {
    // validate card
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // validate date
    if (dto.start_date && dto.end_date) {
      if (new Date(dto.start_date) > new Date(dto.end_date)) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    }

    card.start_date = dto.start_date ? new Date(dto.start_date) : null;
    card.end_date = dto.end_date ? new Date(dto.end_date) : null;
    card.is_completed = dto.is_completed ?? false;
    card.updated_at = new Date();
    await this.cardRepository.save(card);

    return this.findOne(cardId);
  }

  // toggle complete card
  async toggleCompleteCard(cardId: string): Promise<Card> {
    // validate card
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // toggle complete
    card.is_completed = !card.is_completed;

    // update updated_at
    card.updated_at = new Date();
    await this.cardRepository.save(card);

    return this.findOne(cardId);
  }

  // ============ Checklists ============
  async createChecklist(cardId: string, dto: CreateChecklistDto): Promise<Checklist> {
    const maxPos = await this.checklistRepository
      .createQueryBuilder('checklist')
      .where('checklist.card_id = :cardId', { cardId })
      .select('MAX(checklist.position)', 'max')
      .getRawOne();
    const position = maxPos?.max ? Number(maxPos.max) + 1 : 1;

    const checklist = this.checklistRepository.create({
      card_id: cardId,
      name: dto.name,
      position: Number(position),
    });
    return this.checklistRepository.save(checklist);
  }

  async updateChecklist(
    cardId: string,
    checklistId: string,
    dto: UpdateChecklistDto,
  ): Promise<Checklist> {
    await this.checklistRepository.update({ id: checklistId, card_id: cardId }, dto);
    const updated = await this.checklistRepository.findOne({ where: { id: checklistId } });
    if (!updated) {
      throw new NotFoundException('Checklist not found');
    }
    return updated;
  }

  async removeChecklist(cardId: string, checklistId: string): Promise<void> {
    await this.checklistRepository.delete({ id: checklistId, card_id: cardId });
  }

  async getCardChecklists(cardId: string): Promise<Checklist[]> {
    return this.checklistRepository.find({
      where: { card_id: cardId },
      relations: ['items'],
      order: { position: 'ASC' },
    });
  }

  // ============ Checklist Items ============
  async createChecklistItem(
    checklistId: string,
    dto: CreateChecklistItemDto,
  ): Promise<ChecklistItem> {
    const maxPos = await this.checklistItemRepository
      .createQueryBuilder('item')
      .where('item.checklist_id = :checklistId', { checklistId })
      .select('MAX(item.position)', 'max')
      .getRawOne();
    const position = maxPos?.max ? Number(maxPos.max) + 1 : 1;

    const item = this.checklistItemRepository.create({
      checklist_id: checklistId,
      content: dto.name,
      is_checked: dto.is_completed ?? false,
      position,
    });
    return this.checklistItemRepository.save(item);
  }

  async updateChecklistItem(
    checklistId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
  ): Promise<ChecklistItem> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.content = dto.name;
    if (dto.is_completed !== undefined) {
      updateData.is_checked = dto.is_completed;
      updateData.completed_at = dto.is_completed ? new Date() : null;
    }
    if (dto.position !== undefined) updateData.position = dto.position;

    await this.checklistItemRepository.update(
      { id: itemId, checklist_id: checklistId },
      updateData,
    );
    const updated = await this.checklistItemRepository.findOne({ where: { id: itemId } });
    if (!updated) {
      throw new NotFoundException('Checklist item not found');
    }
    return updated;
  }

  async removeChecklistItem(checklistId: string, itemId: string): Promise<void> {
    await this.checklistItemRepository.delete({ id: itemId, checklist_id: checklistId });
  }

  // ============ Card Labels ============
  async addLabelToCard(cardId: string, dto: AddLabelToCardDto): Promise<{ message: string }> {
    // Validate card exists
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Validate label exists
    const label = await this.labelRepository.findOne({ where: { id: dto.label_id } });
    if (!label) {
      throw new NotFoundException(`Label with ID ${dto.label_id} not found`);
    }

    // Validate label belongs to the same board as the card
    if (label.board_id !== card.board_id) {
      throw new BadRequestException(
        `Label does not belong to the same board as the card. Label belongs to board ${label.board_id}, but card belongs to board ${card.board_id}`,
      );
    }

    // Check if already added
    const existing = await this.cardLabelRepository.findOne({
      where: { card_id: cardId, label_id: dto.label_id },
    });
    if (existing) {
      return { message: 'Label is already attached to this card' };
    }

    await this.cardLabelRepository.save({
      card_id: cardId,
      label_id: dto.label_id,
    });

    return { message: `Label '${label.name || label.color}' added to card successfully` };
  }

  async removeLabelFromCard(cardId: string, labelId: string): Promise<{ message: string }> {
    // Validate card exists
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Validate label exists on card
    const cardLabel = await this.cardLabelRepository.findOne({
      where: { card_id: cardId, label_id: labelId },
    });
    if (!cardLabel) {
      throw new NotFoundException(`Label with ID ${labelId} is not attached to this card`);
    }

    await this.cardLabelRepository.delete({ card_id: cardId, label_id: labelId });

    return { message: 'Label removed from card successfully' };
  }

  // ============ Move Card ============
  async moveCard(cardId: string, dto: import('../dto').MoveCardDto, userId: string): Promise<Card> {
    const { targetListId, newIndex } = dto;
    // 1. Lấy card hiện tại
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');

    // 2. Lấy list đích và kiểm tra quyền
    const targetList = await this.listRepository.findOne({ where: { id: targetListId } });
    if (!targetList) throw new NotFoundException('Target list not found');
    if (card.board_id !== targetList.board_id) {
      const boardMember = await this.cardRepository.manager.query(
        `SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2 LIMIT 1`,
        [targetList.board_id, userId],
      );
      if (!boardMember.length) {
        throw new ForbiddenException('You are not a member of the target board');
      }
    }

    // 3. Lấy tất cả cards trong list đích, sort theo position ASC
    const cardsInTarget = await this.cardRepository.find({
      where: { list_id: targetListId },
      order: { position: 'ASC' },
      select: ['id', 'position'],
    });

    // 4. Tính position mới
    let newPosition: number;
    if (cardsInTarget.length === 0) {
      newPosition = 1024;
    } else if (newIndex <= 0) {
      newPosition = cardsInTarget[0].position - 1024;
    } else if (newIndex >= cardsInTarget.length) {
      newPosition = cardsInTarget[cardsInTarget.length - 1].position + 1024;
    } else {
      const prev = cardsInTarget[newIndex - 1].position;
      const next = cardsInTarget[newIndex].position;
      newPosition = (prev + next) / 2;
    }

    // 5. Update card
    card.list_id = targetListId;
    card.board_id = targetList.board_id;
    card.position = newPosition;
    await this.cardRepository.save(card);

    return card;
  }

  //==========Attchment============
  async addAttachment(
    id: string,
    dto: import('../dto/create-attachment.dto').CreateAttachmentDto,
    userId: string,
  ) {
    const card = await this.findOne(id);
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    const attachment = this.attachmentRepository.create({
      card_id: id,
      url: dto.url,
      file_name: dto.file_name,
      size_bytes: dto.size_bytes?.toString(),
      mime_type: dto.mime_type,
      uploader_id: userId,
    } as Partial<import('../entities/attachment.entity').Attachment>);
    const saved = await this.attachmentRepository.save(attachment);
    await this.cardRepository.increment({ id }, 'attachments_count', 1);
    return saved;
  }
  async setCover(id: string, dto: import('../dto/set-cover.dto').SetCoverDto) {
    const card = await this.findOne(id);
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    if (dto.attachmentId) {
      // Nếu chọn cover là attachment
      card.cover_attachment_id = dto.attachmentId;
      card.cover_color = undefined;
    } else if (dto.color) {
      // Nếu chọn cover là màu
      card.cover_color = dto.color;
      card.cover_attachment_id = undefined;
    } else {
      // Clear cover
      card.cover_attachment_id = undefined;
      card.cover_color = undefined;
    }
    await this.cardRepository.save(card);
    return card;
  }
  // Helper
  private async getNextPosition(listId: string): Promise<number> {
    // ✅ Đổi từ bigint sang number
    const maxPos = await this.cardRepository
      .createQueryBuilder('card')
      .where('card.list_id = :listId', { listId })
      .select('MAX(card.position)', 'max')
      .getRawOne();
    return maxPos?.max ? Number(maxPos.max) + 1 : 1;
  }
}
