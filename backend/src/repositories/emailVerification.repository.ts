import { prisma } from '../config/db';

export function create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  return prisma.emailVerificationToken.create({ data });
}

/** Looked up by hash, because the raw token is never stored. */
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

/**
 * Retires every outstanding link for a user. Called when a new one is issued and
 * on success, so a re-send invalidates the previous email rather than leaving
 * several working links scattered across an inbox.
 */
export function invalidateAllForUser(userId: string) {
  return prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

/** How many links were issued to this user since `since` — the re-send throttle. */
export function countRecent(userId: string, since: Date) {
  return prisma.emailVerificationToken.count({
    where: { userId, createdAt: { gte: since } },
  });
}

/** Marks the account's email as proven. */
export function markUserVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, emailVerifiedAt: new Date() },
  });
}
