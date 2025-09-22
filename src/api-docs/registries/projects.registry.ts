import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createApiResponse } from '../openAPIResponseBuilders';

export const projectsRegistry = new OpenAPIRegistry();

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

projectsRegistry.registerPath({
  method: 'get',
  path: '/api/projects',
  tags: ['Projects'],
  responses: createApiResponse(z.array(ProjectSchema), 'List projects'),
});
