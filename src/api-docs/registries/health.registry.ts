import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createApiResponse } from '../openAPIResponseBuilders';

export const healthRegistry = new OpenAPIRegistry();

const HealthSchema = z.object({
  status: z.literal('ok'),
  uptime: z.number(),
});

healthRegistry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  responses: createApiResponse(HealthSchema, 'Health check'),
});
