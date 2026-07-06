import type { CategorySummary } from './category.types';

export interface Product {
  id: string;
  name: string;
  description: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  category: CategorySummary;
}
