import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
});

export const verifyEsewaSchema = z.object({
  data: z.string().min(1, 'Payment response is required'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type VerifyEsewaDto = z.infer<typeof verifyEsewaSchema>;
