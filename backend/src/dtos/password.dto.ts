import { z } from 'zod';
import { passwordSchema } from './auth.dto';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Your new password must be different from your current one',
    path: ['newPassword'],
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
