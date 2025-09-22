import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createApiResponse } from '../openAPIResponseBuilders';

export const usersRegistry = new OpenAPIRegistry();

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateUserDto = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

usersRegistry.registerPath({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  responses: createApiResponse(z.array(UserSchema), 'List users'),
});

usersRegistry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': { schema: CreateUserDto },
      },
    },
  },
  responses: createApiResponse(UserSchema, 'Create user', 201),
});
