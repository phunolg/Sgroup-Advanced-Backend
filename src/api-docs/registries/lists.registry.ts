import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export const listsRegistry = new OpenAPIRegistry();

export const ListSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  title: z.string(),
  name: z.string(),
  position: z.number(),
});

export const UpdateListNameDto = z.object({
  name: z.string().min(1).max(255),
});

export const ReorderListDto = z.object({
  newIndex: z.number().int().nonnegative(),
});

listsRegistry.registerPath({
  method: 'patch',
  path: '/api/boards/{boardId}/lists/{listId}',
  tags: ['Lists'],
  summary: 'Update list name',
  description: 'Rename a list. Only board members or owners can perform this action.',
  request: {
    body: {
      content: {
        'application/json': { schema: UpdateListNameDto },
      },
    },
  },
  responses: {
    200: {
      description: 'List name updated successfully',
      content: {
        'application/json': { schema: ListSchema },
      },
    },
    400: {
      description: 'Invalid input - name cannot be empty or exceed character limit',
    },
    403: {
      description: 'Forbidden - user is not a member of the board',
    },
    404: {
      description: 'List not found',
    },
  },
});

listsRegistry.registerPath({
  method: 'patch',
  path: '/api/lists/{listId}/reorder',
  tags: ['Lists'],
  summary: 'Reorder a list within its board',
  description: 'Update a list position using fractional ordering to avoid renumbering all lists.',
  request: {
    body: {
      content: {
        'application/json': { schema: ReorderListDto },
      },
    },
  },
  responses: {
    200: {
      description: 'List reordered successfully',
      content: {
        'application/json': { schema: ListSchema },
      },
    },
    403: {
      description: 'Forbidden - user is not a member of the board',
    },
    404: {
      description: 'List not found',
    },
  },
});
