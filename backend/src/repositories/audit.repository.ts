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

export function findRecent(limit: number) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true },
  });
}
