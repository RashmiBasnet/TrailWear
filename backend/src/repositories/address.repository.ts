import { prisma } from '../config/db';
import type { CreateAddressDto } from '../dtos/profile.dto';

export function create(userId: string, data: CreateAddressDto) {
  return prisma.address.create({ data: { ...data, userId } });
}

export function findByUser(userId: string) {
  return prisma.address.findMany({ where: { userId } });
}
