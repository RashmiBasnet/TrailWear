import { prisma } from '../config/db';

export function create(data: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  ip?: string | null;
}) {
  return prisma.auditLog.create({ data });
}

export function findRecent(limit: number) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true },
  });
}
