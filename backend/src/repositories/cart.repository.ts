import { prisma } from '../config/db';

const CATEGORY_SUMMARY_SELECT = { id: true, name: true, slug: true } as const;

const CART_INCLUDE = {
  items: {
    orderBy: { id: 'asc' as const },
    include: {
      product: { include: { category: { select: CATEGORY_SUMMARY_SELECT } } },
    },
  },
} as const;

export function findByUserWithItems(userId: string) {
  return prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
}

export function upsertForUser(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export function upsertItem(cartId: string, productId: string, quantity: number, size: string) {
  return prisma.cartItem.upsert({
    where: { cartId_productId_size: { cartId, productId, size } },
    create: { cartId, productId, quantity, size },
    update: { quantity: { increment: quantity } },
  });
}

export function findItemForUser(itemId: string, userId: string) {
  return prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
}

export function updateItemQuantity(itemId: string, quantity: number) {
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export function deleteItem(itemId: string) {
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function deleteItemForUser(itemId: string, userId: string) {
  const { count } = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId } },
  });
  return count;
}

export function clearByUser(userId: string) {
  return prisma.cartItem.deleteMany({ where: { cart: { userId } } });
}
