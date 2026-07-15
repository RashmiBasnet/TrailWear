import type { Request } from 'express';
import * as auditRepository from '../repositories/audit.repository';
import { auditLogger, logger } from '../config/logger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Records a privileged action to both sinks:
 *  - winston's audit log (append-only file, rotated, long retention)
 *  - the AuditLog table (queryable, so admin activity can be surfaced in the UI)
 *
 * Deliberately never throws: an audit failure must not roll back or fail the
 * action the admin actually performed.
 */
export async function record(
  req: Request,
  action: AuditAction,
  entity: string,
  entityId?: string | null
): Promise<void> {
  const actor = req.user;
  if (!actor) return;

  const entry = {
    userId: actor.id,
    action,
    entity,
    entityId: entityId ?? null,
    ip: req.ip ?? null,
  };

  // The file log carries the actor's email too, so it stays readable on its own
  // without needing a join back to the users table.
  auditLogger.info('admin.action', { ...entry, email: actor.email });

  try {
    await auditRepository.create(entry);
  } catch (err) {
    logger.error('Failed to persist audit log to database', { err, entry });
  }
}

export function listRecent(limit = 100) {
  return auditRepository.findRecent(limit);
}
