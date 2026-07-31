import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export function create(data: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ip?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}) {
  return prisma.auditLog.create({
    data: {
      ...data,
      metadata: data.metadata ?? Prisma.JsonNull,
    },
  });
}

// Only ever expose these user fields on the audit read path — never the
// password hash, MFA secret, or verification tokens the full row carries.
const publicUserSelect = { id: true, email: true, name: true } as const;

export function findRecent(limit: number) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: publicUserSelect } },
  });
}

export async function findPaginated(params: {
  where: Prisma.AuditLogWhereInput;
  skip: number;
  take: number;
}) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: params.where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
      include: { user: { select: publicUserSelect } },
    }),
    prisma.auditLog.count({ where: params.where }),
  ]);

  return { items, total };
}
