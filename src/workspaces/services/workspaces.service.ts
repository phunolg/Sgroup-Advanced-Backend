import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../dto';
import { User } from 'src/users/entities/user.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly repo: Repository<Workspace>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateWorkspaceDto, userId: string): Promise<Workspace> {
    const entity = this.repo.create({ ...dto });

    const savedWorkspace = await this.repo.save(entity);
    // Trước khi lưu workspace thì lưu workspace member với vai trò là owner, chính là người tạo
    const ownerMember = new WorkspaceMember();
    ownerMember.workspace_id = savedWorkspace.id;
    // userid lấy từ token lưu ở cookies
    ownerMember.user_id = userId;
    ownerMember.role = 'owner';
    savedWorkspace.members = [...(savedWorkspace.members || []), ownerMember];
    // save to db
    await this.repo.manager.getRepository(WorkspaceMember).save(ownerMember);
    return savedWorkspace;
  }

  async findAll(): Promise<Workspace[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<Workspace> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Workspace not found');
    return found;
  }

  async update(id: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  // add member to workspace
  async addMember(workspaceId: string, userId: string): Promise<void> {
    // ensure workspace exists
    const workspace = await this.repo.findOne({ where: { id: workspaceId } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const memberRepo = this.repo.manager.getRepository(WorkspaceMember);

    // check existing membership directly in member repo
    const memberExists = await memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
    if (memberExists) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    // create + save new member via its repository
    const newMember = memberRepo.create({
      workspace_id: workspaceId,
      user_id: userId,
      role: 'member',
    });

    // verify target user exists
    const userRepo = this.repo.manager.getRepository(User);
    const userInfo = await userRepo.findOne({ where: { id: userId } });
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    await memberRepo.save(newMember);

    // optionally send notification mail
    await this.mailService.sendNotificationAddWorkspace(
      userInfo.email,
      userInfo.name,
      workspace.name,
      undefined,
    );
  }
}
