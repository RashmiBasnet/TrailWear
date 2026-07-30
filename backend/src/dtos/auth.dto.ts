import { z } from 'zod';
import { stripHtml } from '../utils/sanitize';

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  'passw0rd',
  'qwerty123',
  'welcome1',
  'welcome123',
  'admin123',
  'letmein1',
  'iloveyou1',
  'trailwear',
  'trailwear1',
  'abcd1234',
  'abc12345',
  '12345678',
  '123456789',
  'football1',
  'monkey123',
  'dragon123',
  'sunshine1',
]);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), {
    message: 'That password is too common, please choose another',
  });

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().trim().min(1, 'Name is required').max(100).transform(stripHtml),
  captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captchaToken: z.string().optional(),
});

export const googleCallbackSchema = z.object({
  code: z.string().min(1, 'Missing authorization code'),
  state: z.string().min(1, 'Missing state'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Missing verification token'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RegisterDto = Omit<z.infer<typeof registerSchema>, 'captchaToken'>;
export type LoginDto = z.infer<typeof loginSchema>;
export type GoogleCallbackDto = z.infer<typeof googleCallbackSchema>;
