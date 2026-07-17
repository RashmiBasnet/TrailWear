import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import * as historyRepository from '../repositories/passwordHistory.repository';
import { AppError } from '../utils/AppError';
import { isStrongEnough } from '../utils/passwordStrength';
import type { ChangePasswordDto } from '../dtos/password.dto';

/**
 * How many previous passwords are remembered and refused. 5 is the common
 * baseline (CIS Benchmarks); more history means keeping old hashes around for
 * longer, which is itself a liability, so this is a deliberate balance.
 */
export const PASSWORD_HISTORY_COUNT = 5;

/**
 * Maximum password age before a change is forced.
 *
 * Note: NIST SP 800-63B §5.1.1.2 advises AGAINST arbitrary periodic expiry,
 * because it pushes users toward predictable mutations (Summer1 -> Summer2).
 * It is implemented here because the coursework specification requires it, and
 * the reuse check above is what stops the mutation habit it would otherwise
 * encourage. 90 days is the conventional interval.
 */
export const PASSWORD_MAX_AGE_DAYS = 90;

const MAX_AGE_MS = PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export function isPasswordExpired(passwordChangedAt: Date): boolean {
  return Date.now() - passwordChangedAt.getTime() > MAX_AGE_MS;
}

export function daysUntilExpiry(passwordChangedAt: Date): number {
  const remaining = MAX_AGE_MS - (Date.now() - passwordChangedAt.getTime());
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

/**
 * Changes a password after proving the current one, checking strength, and
 * rejecting anything matching a recent password.
 *
 * Every session is invalidated (tokenVersion is bumped by the repository): if
 * the change was prompted by a suspected compromise, leaving other sessions
 * alive would defeat the point.
 */
export async function changePassword(userId: string, input: ChangePasswordDto): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // No password to change, and no current one to prove. Adding a first password
  // to a Google account is a different operation with different rules (nothing
  // to verify against), so it is refused here rather than half-handled.
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

  // The current password counts as reused even though it is not yet in history.
  if (await argon2.verify(user.password, input.newPassword)) {
    throw new AppError(400, 'Your new password must be different from your current one');
  }

  // Hashes are salted, so a reused password produces a different hash each time
  // and cannot be found by comparison — each stored hash must be verified.
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

  // Record the outgoing password before overwriting it, so it is refused next time.
  await historyRepository.add(userId, user.password);
  await userRepository.updatePassword(userId, hash);
  await historyRepository.trim(userId, PASSWORD_HISTORY_COUNT);
}
