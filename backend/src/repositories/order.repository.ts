import { prisma } from '../config/db';

const CATEGORY_SUMMARY_SELECT = { id: true, name: true, slug: true } as const;
const ORDER_INCLUDE = {
  address: true,
  items: {
    include: { product: { include: { category: { select: CATEGORY_SUMMARY_SELECT } } } },
  },
} as const;

export interface NewOrderItem {
  productId: string;
  quantity: number;
  price: number;
  size: string;
}

export function findByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

export function findByIdForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({ where: { id: orderId, userId }, include: ORDER_INCLUDE });
}

export function createFromCart(
  userId: string,
  addressId: string,
  items: NewOrderItem[],
  total: number
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error(`STOCK:${product?.name ?? 'Item'} is no longer available in that quantity`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        total,
        items: { create: items },
      },
      include: ORDER_INCLUDE,
    });

    await tx.cartItem.deleteMany({ where: { cart: { userId } } });

    return order;
  });
}
