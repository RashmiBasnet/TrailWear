import type { Request } from 'express';
import * as auditRepository from '../repositories/audit.repository';
import { auditLogger, logger } from '../config/logger';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'REGISTER'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGIN_LOCKED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFIED'
  | 'LOGIN_UNVERIFIED'
  | 'ACCOUNT_RECLAIMED'
  | 'GOOGLE_LOGIN'
  | 'GOOGLE_REGISTER'
  | 'GOOGLE_LOGIN_FAILED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'MFA_FAILED'
  | 'MFA_BACKUP_USED'
  | 'ORDER_PLACED'
  | 'PROFILE_UPDATED'
  | 'CAPTCHA_FAILED';

export interface AuditInput {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function record(req: Request, input: AuditInput): Promise<void> {
  const userId = input.userId !== undefined ? input.userId : req.user?.id ?? null;

  const entry = {
    userId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    ip: req.ip ?? null,
    metadata: (input.metadata ?? null) as never,
  };

  auditLogger.info(input.action.toLowerCase(), {
    ...entry,
    email: req.user?.email,
    userAgent: req.get('user-agent'),
  });

  try {
    await auditRepository.create(entry);
  } catch (err) {
    logger.error('Failed to persist audit log to database', { err, entry });
  }
}

export function listRecent(limit = 100) {
  return auditRepository.findRecent(limit);
}
