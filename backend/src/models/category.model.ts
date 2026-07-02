import type { Category as PrismaCategory } from '@prisma/client';
import type {
  Category,
  CategorySummary,
  CategoryWithCount,
} from '../types/category.types';

export function toCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
  };
}

export function toCategorySummary(
  category: Pick<PrismaCategory, 'id' | 'name' | 'slug'>
): CategorySummary {
  return { id: category.id, name: category.name, slug: category.slug };
}

export function toCategoryWithCount(
  category: PrismaCategory & { _count: { products: number } }
): CategoryWithCount {
  return { ...toCategory(category), productCount: category._count.products };
}
