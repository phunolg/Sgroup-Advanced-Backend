import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export function wrapAsResponse(schema: z.ZodTypeAny) {
  return schema;
}

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  statusCode: number = StatusCodes.OK,
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: wrapAsResponse(schema),
        },
      },
    },
  };
}
