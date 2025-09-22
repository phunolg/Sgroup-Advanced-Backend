import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';

@ApiTags('Projects')
@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @ApiOperation({ summary: 'List projects' })
  @ApiResponse({ status: 200, description: 'OK', type: [Project] })
  @Get()
  list(): Promise<Project[]> {
    return this.projects.findAll();
  }
}
