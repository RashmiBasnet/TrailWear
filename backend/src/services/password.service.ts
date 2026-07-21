import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import * as historyRepository from '../repositories/passwordHistory.repository';
import { AppError } from '../utils/AppError';
import { isStrongEnough } from '../utils/passwordStrength';
import type { ChangePasswordDto } from '../dtos/password.dto';

export const PASSWORD_HISTORY_COUNT = 5;

export const PASSWORD_MAX_AGE_DAYS = 90;

const MAX_AGE_MS = PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export function isPasswordExpired(passwordChangedAt: Date): boolean {
  return Date.now() - passwordChangedAt.getTime() > MAX_AGE_MS;
}

export function daysUntilExpiry(passwordChangedAt: Date): number {
  const remaining = MAX_AGE_MS - (Date.now() - passwordChangedAt.getTime());
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

export async function changePassword(userId: string, input: ChangePasswordDto): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (!user.password) {
    throw new AppError(400, 'This account signs in with Google and has no password to change.');
  }

  if (!(await argon2.verify(user.password, input.currentPassword))) {
    throw new AppError(401, 'Your current password is incorrect');
  }

  const strength = isStrongEnough(input.newPassword, [user.email, user.name, 'trailwear']);
  if (!strength.ok) {
    throw new AppError(
      400,
      strength.warning || 'That password is too easy to guess. Try a longer or less common one.'
    );
  }

  if (await argon2.verify(user.password, input.newPassword)) {
    throw new AppError(400, 'Your new password must be different from your current one');
  }

  const history = await historyRepository.findRecent(userId, PASSWORD_HISTORY_COUNT);
  for (const entry of history) {
    if (await argon2.verify(entry.hash, input.newPassword)) {
      throw new AppError(
        400,
        `You cannot reuse any of your last ${PASSWORD_HISTORY_COUNT} passwords`
      );
    }
  }

  const hash = await argon2.hash(input.newPassword);

  await historyRepository.add(userId, user.password);
  await userRepository.updatePassword(userId, hash);
  await historyRepository.trim(userId, PASSWORD_HISTORY_COUNT);
}
