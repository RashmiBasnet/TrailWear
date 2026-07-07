import type { User as PrismaUser } from '@prisma/client';
import type { PublicUser } from '../types/user.types';

export function toPublicUser(user: PrismaUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
