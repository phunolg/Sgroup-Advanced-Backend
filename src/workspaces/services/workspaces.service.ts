import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly repo: Repository<Workspace>,
  ) {}

  async create(dto: CreateWorkspaceDto): Promise<Workspace> {
    const entity = this.repo.create({ ...dto });
    return this.repo.save(entity);
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
}
