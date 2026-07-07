import type { ProductWithCategory } from './product.types';

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: ProductWithCategory;
}

export interface CartSummary {
  id: string | null;
  items: CartItemWithProduct[];
  subtotal: number;
}
