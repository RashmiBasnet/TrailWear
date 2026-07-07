import { Prisma } from '@prisma/client';
import * as productRepository from '../repositories/product.repository';
import * as categoryRepository from '../repositories/category.repository';
import { toProductWithCategory } from '../models/product.model';
import { AppError } from '../utils/AppError';
import type {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from '../dtos/product.dto';
import type { ProductWithCategory } from '../types/product.types';
import type { Pagination } from '../types/common.types';

export async function listProducts(
  query: ListProductsQueryDto
): Promise<{ products: ProductWithCategory[]; pagination: Pagination }> {
  const { category, gender, search, page, limit } = query;

  const { products, total } = await productRepository.findPage(
    { categorySlug: category, gender, search },
    page,
    limit
  );

  return {
    products: products.map(toProductWithCategory),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProductById(id: string): Promise<ProductWithCategory> {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }
  return toProductWithCategory(product);
}

export async function createProduct(
  input: CreateProductDto
): Promise<ProductWithCategory> {
  const category = await categoryRepository.findById(input.categoryId);
  if (!category) {
    throw new AppError(400, 'Category does not exist');
  }

  const product = await productRepository.create(input);
  return toProductWithCategory(product);
}

export async function updateProduct(
  id: string,
  input: UpdateProductDto
): Promise<ProductWithCategory> {
  if (input.categoryId) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError(400, 'Category does not exist');
    }
  }

  try {
    const product = await productRepository.update(id, input);
    return toProductWithCategory(product);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Product not found');
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  try {
    await productRepository.deleteWithRelations(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(409, 'Product has existing orders and cannot be deleted');
    }
    throw err;
  }
}
