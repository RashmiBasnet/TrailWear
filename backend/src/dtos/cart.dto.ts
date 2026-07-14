import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().min(1).default(1),
  size: z.string().trim().optional().default(''),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
