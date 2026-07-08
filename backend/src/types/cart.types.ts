import type { ProductWithCategory } from './product.types';

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  size: string;
  product: ProductWithCategory;
}

export interface CartSummary {
  id: string | null;
  items: CartItemWithProduct[];
  subtotal: number;
}
