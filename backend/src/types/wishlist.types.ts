import type { ProductWithCategory } from './product.types';

export interface WishlistEntry {
  id: string;
  addedAt: Date;
  product: ProductWithCategory;
}
