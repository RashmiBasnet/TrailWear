import type { Address as PrismaAddress } from '@prisma/client';
import type { Address } from '../types/address.types';

export function toAddress(address: PrismaAddress): Address {
  return {
    id: address.id,
    userId: address.userId,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    country: address.country,
    zip: address.zip,
  };
}
