import type { Cart as PrismaCart, CartItem as PrismaCartItem } from '@prisma/client';
import type { CartItemWithProduct, CartSummary } from '../types/cart.types';
import { toProductWithCategory, type PrismaProductWithCategory } from './product.model';

export type PrismaCartWithItems = PrismaCart & {
  items: (PrismaCartItem & { product: PrismaProductWithCategory })[];
};

export function toCartItem(
  item: PrismaCartItem & { product: PrismaProductWithCategory }
): CartItemWithProduct {
  return {
    id: item.id,
    quantity: item.quantity,
    product: toProductWithCategory(item.product),
  };
}

export function toCartSummary(cart: PrismaCartWithItems | null): CartSummary {
  const items = (cart?.items ?? []).map(toCartItem);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return {
    id: cart?.id ?? null,
    items,
    subtotal: Number(subtotal.toFixed(2)),
  };
}
