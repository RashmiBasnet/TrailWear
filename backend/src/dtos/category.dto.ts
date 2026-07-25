import { z } from 'zod';
import { stripHtml } from '../utils/sanitize';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).transform(stripHtml),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  description: z.string().trim().optional(),
  image: z.string().url().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
