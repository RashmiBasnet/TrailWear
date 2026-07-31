import { prisma } from '../config/db';

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findByGoogleId(googleId: string) {
  return prisma.user.findUnique({ where: { googleId } });
}

export function create(data: { email: string; password: string; name: string }) {
  return prisma.user.create({ data });
}

export function createWithGoogle(data: { email: string; googleId: string; name: string }) {
  return prisma.user.create({
    data: { ...data, emailVerified: true, emailVerifiedAt: new Date() },
  });
}

export function linkGoogle(id: string, googleId: string) {
  return prisma.user.update({ where: { id }, data: { googleId } });
}

export function linkGoogleAndReclaim(id: string, googleId: string) {
  return prisma.user.update({
    where: { id },
    data: {
      googleId,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      password: null,
      tokenVersion: { increment: 1 },
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

export function updateName(id: string, name: string) {
  return prisma.user.update({ where: { id }, data: { name } });
}

export function findAll() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

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

export function setMfaSecret(id: string, encryptedSecret: string) {
  return prisma.user.update({
    where: { id },
    data: { mfaSecret: encryptedSecret },
  });
}

export function enableMfa(id: string, backupCodeHashes: string[], step: number) {
  return prisma.user.update({
    where: { id },
    data: { mfaEnabled: true, mfaBackupCodes: backupCodeHashes, mfaLastUsedStep: step },
  });
}

export function disableMfa(id: string) {
  return prisma.user.update({
    where: { id },
    data: { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: [], mfaLastUsedStep: null },
  });
}

export function setMfaLastUsedStep(id: string, step: number) {
  return prisma.user.update({
    where: { id },
    data: { mfaLastUsedStep: step },
  });
}

export function updatePassword(id: string, hash: string) {
  return prisma.user.update({
    where: { id },
    data: {
      password: hash,
      passwordChangedAt: new Date(),
      tokenVersion: { increment: 1 },
    },
  });
}

export function setBackupCodes(id: string, backupCodeHashes: string[]) {
  return prisma.user.update({
    where: { id },
    data: { mfaBackupCodes: backupCodeHashes },
  });
}
