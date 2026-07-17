import * as userRepository from '../repositories/user.repository';
import * as addressRepository from '../repositories/address.repository';
import * as passwordService from './password.service';
import { toPublicUser } from '../models/user.model';
import { toAddress } from '../models/address.model';
import { AppError } from '../utils/AppError';
import type { CreateAddressDto } from '../dtos/profile.dto';
import type { PublicUser } from '../types/user.types';
import type { Address } from '../types/address.types';

export async function getPasswordStatus(userId: string): Promise<{
  hasPassword: boolean;
  expired: boolean;
  daysUntilExpiry: number;
  changedAt: Date;
}> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // A Google-only account has a passwordChangedAt (it defaults to signup time)
  // but no password, so ageing it would report a countdown to the expiry of
  // nothing. hasPassword lets the profile page hide the whole section instead.
  if (!user.password) {
    return {
      hasPassword: false,
      expired: false,
      daysUntilExpiry: passwordService.PASSWORD_MAX_AGE_DAYS,
      changedAt: user.passwordChangedAt,
    };
  }

  return {
    hasPassword: true,
    expired: passwordService.isPasswordExpired(user.passwordChangedAt),
    daysUntilExpiry: passwordService.daysUntilExpiry(user.passwordChangedAt),
    changedAt: user.passwordChangedAt,
  };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toPublicUser(user);
}

export async function updateName(userId: string, name: string): Promise<PublicUser> {
  const user = await userRepository.updateName(userId, name);
  return toPublicUser(user);
}

export async function addAddress(
  userId: string,
  input: CreateAddressDto
): Promise<Address> {
  const address = await addressRepository.create(userId, input);
  return toAddress(address);
}

export async function listAddresses(userId: string): Promise<Address[]> {
  const addresses = await addressRepository.findByUser(userId);
  return addresses.map(toAddress);
}
