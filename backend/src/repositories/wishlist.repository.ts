import { prisma } from '../config/db';

const CATEGORY_SUMMARY_SELECT = { id: true, name: true, slug: true } as const;

const WISHLIST_INCLUDE = {
  product: { include: { category: { select: CATEGORY_SUMMARY_SELECT } } },
} as const;

export function findByUser(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: 'desc' },
    include: WISHLIST_INCLUDE,
  });
}

export function upsert(userId: string, productId: string) {
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
}

export function deleteByUserAndProduct(userId: string, productId: string) {
  return prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}
