import type { WishlistItem as PrismaWishlistItem } from '@prisma/client';
import type { WishlistEntry } from '../types/wishlist.types';
import { toProductWithCategory, type PrismaProductWithCategory } from './product.model';

export function toWishlistEntry(
  item: PrismaWishlistItem & { product: PrismaProductWithCategory }
): WishlistEntry {
  return {
    id: item.id,
    addedAt: item.addedAt,
    product: toProductWithCategory(item.product),
  };
}
