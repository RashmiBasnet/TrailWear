import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string().url('Each image must be a valid URL')).default([]),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateProductSchema = createProductSchema.partial();

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
