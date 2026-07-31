import type { ProductWithCategory } from './product.types';
import type { Address } from './address.types';

export interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price: number;
  size: string;
  product: ProductWithCategory;
}

export interface OrderSummary {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'ESEWA';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  total: number;
  createdAt: Date;
  address: Address | null;
  items: OrderItemWithProduct[];
}
