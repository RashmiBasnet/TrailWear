import { prisma } from '../config/db';

export function findRecent(userId: string, limit: number) {
  return prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function add(userId: string, hash: string) {
  return prisma.passwordHistory.create({ data: { userId, hash } });
}

/**
 * Drops history entries beyond the most recent `keep`, so the table cannot grow
 * without bound and old hashes are not retained longer than the policy needs.
 */
export async function trim(userId: string, keep: number) {
  const stale = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: keep,
    select: { id: true },
  });

  if (stale.length === 0) return;

  await prisma.passwordHistory.deleteMany({
    where: { id: { in: stale.map((entry) => entry.id) } },
  });
}
