import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
