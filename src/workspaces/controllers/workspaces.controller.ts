import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from '../services/workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../dto';
import { Workspace } from '../entities/workspace.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('Workspaces')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  @ApiOperation({ summary: 'Create workspace' })
  @ApiOkResponse({ type: Workspace })
  @Post()
  create(@Body() dto: CreateWorkspaceDto): Promise<Workspace> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List workspaces' })
  @ApiOkResponse({ type: [Workspace] })
  @Get()
  findAll(): Promise<Workspace[]> {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get workspace by id' })
  @ApiOkResponse({ type: Workspace })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Workspace> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update workspace' })
  @ApiOkResponse({ type: Workspace })
  @Roles(Role.ADMIN) // Only ADMIN or SUPERADMIN can update
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto): Promise<Workspace> {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete workspace' })
  @Roles(Role.ADMIN) // Only ADMIN or SUPERADMIN can delete
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    await this.service.remove(id);
    return { success: true };
  }
}
