import type { ProductWithCategory } from './product.types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export type CategorySummary = Pick<Category, 'id' | 'name' | 'slug'>;

export interface CategoryWithCount extends Category {
  productCount: number;
}

export interface CategoryWithProducts extends Category {
  products: ProductWithCategory[];
}
