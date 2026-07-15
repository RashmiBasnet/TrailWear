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
        paymentMethod: 'COD',
        items: { create: items },
      },
      include: ORDER_INCLUDE,
    });

    await tx.cartItem.deleteMany({ where: { cart: { userId } } });

    return order;
  });
}

export function createPendingEsewaOrder(
  userId: string,
  addressId: string,
  items: NewOrderItem[],
  total: number
) {
  return prisma.order.create({
    data: {
      userId,
      addressId,
      total,
      paymentMethod: 'ESEWA',
      paymentStatus: 'PENDING',
      items: { create: items },
    },
    include: ORDER_INCLUDE,
  });
}

export function finalizePaidEsewaOrder(orderId: string, userId: string, refId: string | null) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Already finalized — return as-is (idempotent for repeated callbacks).
    if (order.paymentStatus !== 'PAID') {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`STOCK:${product?.name ?? 'Item'} is no longer available in that quantity`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED', esewaRefId: refId },
      });

      await tx.cartItem.deleteMany({ where: { cart: { userId } } });
    }

    return tx.order.findFirst({ where: { id: orderId }, include: ORDER_INCLUDE });
  });
}

export function markPaymentFailed(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
    include: ORDER_INCLUDE,
  });
}
