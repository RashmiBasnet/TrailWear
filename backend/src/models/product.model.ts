import type { Category as PrismaCategory, Product as PrismaProduct } from '@prisma/client';
import type { Product, ProductWithCategory } from '../types/product.types';
import { toCategorySummary } from './category.model';

export type PrismaProductWithCategory = PrismaProduct & {
  category: Pick<PrismaCategory, 'id' | 'name' | 'slug'>;
};

export function toProduct(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    gender: product.gender,
    sizes: product.sizes,
    price: Number(product.price),
    stock: product.stock,
    images: product.images,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toProductWithCategory(
  product: PrismaProductWithCategory
): ProductWithCategory {
  return {
    ...toProduct(product),
    category: toCategorySummary(product.category),
  };
}
