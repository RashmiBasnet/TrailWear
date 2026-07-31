import { z } from 'zod';
import { stripHtml } from '../utils/sanitize';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).transform(stripHtml),
});

export const createAddressSchema = z.object({
  line1: z.string().trim().min(1, 'Address line 1 is required').max(200).transform(stripHtml),
  line2: z.string().trim().max(200).transform(stripHtml).optional(),
  city: z.string().trim().min(1, 'City is required').max(100).transform(stripHtml),
  country: z.string().trim().min(1, 'Country is required').max(100).transform(stripHtml),
  zip: z.string().trim().min(1, 'ZIP code is required').max(20).transform(stripHtml),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type CreateAddressDto = z.infer<typeof createAddressSchema>;
