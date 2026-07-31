import type { Address as PrismaAddress } from '@prisma/client';
import type { Address } from '../types/address.types';
import { decrypt } from '../utils/crypto';

/**
 * Turns a stored address row into the domain shape, decrypting the fields that
 * are held as ciphertext.
 *
 * Decryption lives here rather than in the repository because this mapper is the
 * only place a `PrismaAddress` becomes an `Address`. Orders load their address
 * through `include: { address: true }` on the order query, so they never pass
 * through the address repository — putting the decrypt there would leave order
 * history showing ciphertext. Encryption on the way in has no such split: the
 * repository owns the single write path.
 */
export function toAddress(address: PrismaAddress): Address {
  return {
    id: address.id,
    userId: address.userId,
    line1: decrypt(address.line1),
    line2: address.line2 === null ? null : decrypt(address.line2),
    // `city` and `country` stay in plaintext deliberately: on their own they do
    // not identify a person, and leaving them queryable keeps shipping filters
    // and per-region reporting possible in SQL rather than after decrypting
    // every row in the application.
    city: address.city,
    country: address.country,
    zip: decrypt(address.zip),
  };
}
