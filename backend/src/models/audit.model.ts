import type { AuditLog, User } from '@prisma/client';

// The audit read path joins the acting user, but only these fields are ever
// exposed — never the password hash, MFA secret, or verification tokens.
export type AuditLogWithUser = AuditLog & {
  user: Pick<User, 'id' | 'email' | 'name'> | null;
};

export interface PublicAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  metadata: unknown;
  createdAt: Date;
  user: { id: string; email: string; name: string } | null;
}

export function toPublicAuditLog(entry: AuditLogWithUser): PublicAuditLog {
  return {
    id: entry.id,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    ip: entry.ip,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
    user: entry.user
      ? { id: entry.user.id, email: entry.user.email, name: entry.user.name }
      : null,
  };
}
