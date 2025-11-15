import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from '../services/workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../dto';
import { Workspace } from '../entities/workspace.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';
import { AddMemberDto } from '../dto/add-member.dto';
import { WorkspaceRoles } from 'src/common/decorators/workspace-roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Workspaces')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  // Accept invitation
  @Public()
  @ApiOperation({ summary: 'Accept invitation to workspace' })
  @Get('accept-invitation')
  async acceptInvitation(@Query('token') token: string): Promise<{ message: string }> {
    return this.service.acceptInvitation(token);
  }

  // Reject invitation
  @Public()
  @ApiOperation({ summary: 'Reject invitation to workspace' })
  @Get('reject-invitation')
  async rejectInvitation(@Query('token') token: string): Promise<{ message: string }> {
    return this.service.rejectInvitation(token);
  }

  @ApiOperation({ summary: 'Create workspace' })
  @ApiOkResponse({ type: Workspace })
  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Req() req: any): Promise<Workspace> {
    const userId = req.user?.sub;
    return this.service.create(dto, userId);
  }

  // Lấy các workspace mà user hiện tại tham gia
  @ApiOperation({ summary: 'Get workspaces for current user' })
  @Get('my-workspaces')
  async getWorkspacesForCurrentUser(@Req() req: any): Promise<Workspace[]> {
    const userId = req.user?.sub;
    return this.service.findWorkspacesForUser(userId);
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

  // Add member to workspace
  @ApiOperation({ summary: 'Add member to workspace' })
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @WorkspaceRoles('owner')
  @Post('members/:workspaceId')
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() body: AddMemberDto,
    @Req() req: any,
  ): Promise<{ success: true; message: string }> {
    const inviterId = req.user?.sub;
    await this.service.addMember(workspaceId, body.email, inviterId);
    return { success: true, message: 'Invitation sent if the user exists' };
  }

  @ApiOperation({ summary: 'Toggle status workspace' })
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @WorkspaceRoles('member', 'owner')
  @Patch('status/:id')
  async toggleStatus(@Param('id') id: string): Promise<Workspace> {
    return this.service.toggleWorkspaceStatus(id);
  }
}
