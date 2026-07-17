import type { Request } from 'express';
import * as auditRepository from '../repositories/audit.repository';
import { auditLogger, logger } from '../config/logger';

/**
 * Every recordable event. Admin mutations plus the account activity a security
 * review or incident response would actually need to reconstruct.
 */
export type AuditAction =
  // Admin mutations
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  // Account activity
  | 'REGISTER'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGIN_LOCKED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  // Google sign-in. Kept distinct from LOGIN/REGISTER so a review can tell how
  // an account was actually entered, not just that it was.
  | 'GOOGLE_LOGIN'
  | 'GOOGLE_REGISTER'
  | 'GOOGLE_LOGIN_FAILED'
  // Second factor
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'MFA_FAILED'
  | 'MFA_BACKUP_USED'
  // Other
  | 'ORDER_PLACED'
  | 'PROFILE_UPDATED'
  | 'CAPTCHA_FAILED';

export interface AuditInput {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  /** Defaults to the authenticated user. Pass explicitly for pre-session events. */
  userId?: string | null;
  /** Extra context. Never put passwords, tokens or codes in here. */
  metadata?: Record<string, unknown> | null;
}

/**
 * Records an event to both sinks:
 *  - winston's audit log (append-only file, rotated, long retention)
 *  - the AuditLog table (queryable, for surfacing activity in the UI)
 *
 * Deliberately never throws: an audit failure must not fail the action the user
 * actually performed.
 */
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
