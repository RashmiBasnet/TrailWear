import type { Address as PrismaAddress, Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import type { OrderItemWithProduct, OrderSummary } from '../types/order.types';
import { toProductWithCategory, type PrismaProductWithCategory } from './product.model';
import { toAddress } from './address.model';

export type PrismaOrderWithRelations = PrismaOrder & {
  address: PrismaAddress | null;
  items: (PrismaOrderItem & { product: PrismaProductWithCategory })[];
};

export function toOrderItem(
  item: PrismaOrderItem & { product: PrismaProductWithCategory }
): OrderItemWithProduct {
  return {
    id: item.id,
    quantity: item.quantity,
    price: Number(item.price),
    size: item.size,
    product: toProductWithCategory(item.product),
  };
}

export function toOrderSummary(order: PrismaOrderWithRelations): OrderSummary {
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    createdAt: order.createdAt,
    address: order.address ? toAddress(order.address) : null,
    items: order.items.map(toOrderItem),
  };
}
