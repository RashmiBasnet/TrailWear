import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const createAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  zip: z.string().min(1, 'ZIP code is required').max(20),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type CreateAddressDto = z.infer<typeof createAddressSchema>;
