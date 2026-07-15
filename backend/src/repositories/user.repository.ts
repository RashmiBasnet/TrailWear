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

/** Retires every JWT previously issued to this user. */
export function incrementTokenVersion(id: string) {
  return prisma.user.update({
    where: { id },
    data: { tokenVersion: { increment: 1 } },
  });
}

export function recordFailedLogin(id: string, attempts: number, lockedUntil: Date | null) {
  return prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: attempts, lockedUntil },
  });
}

export function clearFailedLogins(id: string) {
  return prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}
