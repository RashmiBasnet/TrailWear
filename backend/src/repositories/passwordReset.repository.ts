import { prisma } from '../config/db';

export function create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  return prisma.passwordResetToken.create({ data });
}

export function findByTokenHash(tokenHash: string) {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export function markUsed(id: string) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export function invalidateAllForUser(userId: string) {
  return prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export function countRecent(userId: string, since: Date) {
  return prisma.passwordResetToken.count({
    where: { userId, createdAt: { gte: since } },
  });
}
