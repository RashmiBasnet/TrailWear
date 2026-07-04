import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
});

export type AddWishlistItemDto = z.infer<typeof addWishlistItemSchema>;
