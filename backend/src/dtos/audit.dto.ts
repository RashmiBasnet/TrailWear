import { z } from 'zod';

export const listAuditQuerySchema = z.object({
  action: z.string().min(1).max(64).optional(),
  entity: z.string().min(1).max(64).optional(),
  search: z.string().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListAuditQueryDto = z.infer<typeof listAuditQuerySchema>;
