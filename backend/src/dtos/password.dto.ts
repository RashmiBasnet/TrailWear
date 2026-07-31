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

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  captchaToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Missing reset token'),
  newPassword: passwordSchema,
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
