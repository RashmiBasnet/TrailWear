import { prisma } from '../config/db';

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function create(data: { email: string; password: string; name: string }) {
  return prisma.user.create({ data });
}

export function updateName(id: string, name: string) {
  return prisma.user.update({ where: { id }, data: { name } });
}

export function findAll() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}
