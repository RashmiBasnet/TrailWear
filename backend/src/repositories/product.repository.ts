import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import type { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';

const CATEGORY_SUMMARY_SELECT = { id: true, name: true, slug: true } as const;
const PRODUCT_INCLUDE = { category: { select: CATEGORY_SUMMARY_SELECT } } as const;

export interface ProductFilter {
  categorySlug?: string;
  search?: string;
}

function buildWhere(filter: ProductFilter): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filter.categorySlug) {
    where.category = { slug: filter.categorySlug };
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function findPage(filter: ProductFilter, page: number, limit: number) {
  const where = buildWhere(filter);

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export function findById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
}

export function create(data: CreateProductDto) {
  return prisma.product.create({ data, include: PRODUCT_INCLUDE });
}

export function update(id: string, data: UpdateProductDto) {
  return prisma.product.update({ where: { id }, data, include: PRODUCT_INCLUDE });
}

export function deleteWithRelations(id: string) {
  return prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.wishlistItem.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
}
