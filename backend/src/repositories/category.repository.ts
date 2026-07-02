import { prisma } from '../config/db';
import type { CreateCategoryDto } from '../dtos/category.dto';

const CATEGORY_SUMMARY_SELECT = { id: true, name: true, slug: true } as const;

export function findAll() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export function findById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function findBySlugWithProducts(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
        include: { category: { select: CATEGORY_SUMMARY_SELECT } },
      },
    },
  });
}

export function findByNameOrSlug(name: string, slug: string) {
  return prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
}

export function create(data: CreateCategoryDto) {
  return prisma.category.create({ data });
}
