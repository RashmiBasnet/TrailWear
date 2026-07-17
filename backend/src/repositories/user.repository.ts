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

/**
 * Creates a Google-only account: no password is set, and none is ever required.
 * Verified on creation because the identity is only accepted when Google asserts
 * email_verified, which is a stronger proof than our own link.
 */
export function createWithGoogle(data: { email: string; googleId: string; name: string }) {
  return prisma.user.create({
    data: { ...data, emailVerified: true, emailVerifiedAt: new Date() },
  });
}

/** Attaches a Google identity to an account that has already proven its email. */
export function linkGoogle(id: string, googleId: string) {
  return prisma.user.update({ where: { id }, data: { googleId } });
}

/**
 * Attaches Google to an account whose email was never verified, and strips that
 * account's password in the same write.
 *
 * The reason is account takeover: anyone can register with an address they do
 * not own, so an unverified account carries no proof of ownership. Google's
 * assertion does. Linking without clearing the password would hand the account —
 * now proven to belong to the Google user — to whoever registered it first, with
 * their password still working. tokenVersion is bumped to kill any session they
 * already had.
 */
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

/**
 * Sets a new password. tokenVersion is bumped in the same write so that every
 * session issued under the old password stops validating immediately.
 */
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
