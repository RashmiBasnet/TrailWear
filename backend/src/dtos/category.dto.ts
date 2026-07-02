import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
