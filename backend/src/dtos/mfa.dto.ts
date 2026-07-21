import { z } from 'zod';

const totpCode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Authentication code must be 6 digits');

export const mfaCodeSchema = z.object({
  code: totpCode,
});

export const mfaBackupCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{4}-[0-9a-fA-F]{4}$/, 'Backup code must look like a1b2-c3d4'),
});

export const mfaDisableSchema = z.object({
  password: z.string().optional(),
  code: totpCode,
});

export type MfaCodeDto = z.infer<typeof mfaCodeSchema>;
export type MfaBackupCodeDto = z.infer<typeof mfaBackupCodeSchema>;
export type MfaDisableDto = z.infer<typeof mfaDisableSchema>;
