import * as categoryRepository from '../repositories/category.repository';
import { toCategory, toCategoryWithCount } from '../models/category.model';
import { toProductWithCategory } from '../models/product.model';
import { AppError } from '../utils/AppError';
import type { CreateCategoryDto } from '../dtos/category.dto';
import type {
  Category,
  CategoryWithCount,
  CategoryWithProducts,
} from '../types/category.types';

export async function listCategories(): Promise<CategoryWithCount[]> {
  const categories = await categoryRepository.findAll();
  return categories.map(toCategoryWithCount);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithProducts> {
  const category = await categoryRepository.findBySlugWithProducts(slug);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }
  return {
    ...toCategory(category),
    products: category.products.map(toProductWithCategory),
  };
}

export async function createCategory(input: CreateCategoryDto): Promise<Category> {
  const existing = await categoryRepository.findByNameOrSlug(input.name, input.slug);
  if (existing) {
    throw new AppError(409, 'A category with this name or slug already exists');
  }

  const category = await categoryRepository.create(input);
  return toCategory(category);
}
