import { prisma } from '../config/db';
import type { CreateAddressDto } from '../dtos/profile.dto';
import { encrypt } from '../utils/crypto';

/**
 * Encrypts the identifying parts of an address before it is written.
 *
 * `line1`, `line2` and `zip` together point at a specific doorstep, so they are
 * stored as AES-256-GCM ciphertext. `city` and `country` are left alone — see
 * the note in `models/address.model.ts` for why.
 */
function encryptAddressFields(data: CreateAddressDto) {
  return {
    ...data,
    line1: encrypt(data.line1),
    line2: data.line2 == null || data.line2 === '' ? null : encrypt(data.line2),
    zip: encrypt(data.zip),
  };
}

export function create(userId: string, data: CreateAddressDto) {
  return prisma.address.create({ data: { ...encryptAddressFields(data), userId } });
}

export function findByUser(userId: string) {
  return prisma.address.findMany({ where: { userId } });
}

export function findByIdForUser(id: string, userId: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}
