import { prisma } from '../config/db';

export function create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  return prisma.emailVerificationToken.create({ data });
}

export function findByTokenHash(tokenHash: string) {
  return prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export function markUsed(id: string) {
  return prisma.emailVerificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export function invalidateAllForUser(userId: string) {
  return prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export function countRecent(userId: string, since: Date) {
  return prisma.emailVerificationToken.count({
    where: { userId, createdAt: { gte: since } },
  });
}

export function markUserVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, emailVerifiedAt: new Date() },
  });
}
