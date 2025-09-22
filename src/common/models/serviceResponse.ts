import { z } from 'zod';

export function ServiceResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().default(true),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string().optional(),
        message: z.string().optional(),
      })
      .optional(),
  });
}

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};
