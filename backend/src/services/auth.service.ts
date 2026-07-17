import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import { toPublicUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { isStrongEnough } from '../utils/passwordStrength';
import type { GoogleIdentity } from './google.service';
import type { LoginDto, RegisterDto } from '../dtos/auth.dto';
import type { PublicUser } from '../types/user.types';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export interface AuthedUser extends PublicUser {
  tokenVersion: number;
}

export interface LoginResult {
  user: AuthedUser;
  /** True when the password was correct but a second factor is still required. */
  mfaRequired: boolean;
}

export async function register(input: RegisterDto): Promise<AuthedUser> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  // Enforced here as well as in the browser: the client-side meter is guidance,
  // and anything that only runs in the browser can simply be skipped.
  const strength = isStrongEnough(input.password, [input.email, input.name, 'trailwear']);
  if (!strength.ok) {
    throw new AppError(
      400,
      strength.warning || 'That password is too easy to guess. Try a longer or less common one.'
    );
  }

  const hashed = await argon2.hash(input.password);
  const user = await userRepository.create({
    email: input.email,
    password: hashed,
    name: input.name,
  });

  return { ...toPublicUser(user), tokenVersion: user.tokenVersion };
}

export async function login(input: LoginDto): Promise<LoginResult> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    // Same generic error as a bad password, so this can't be used to
    // discover which emails have accounts.
    throw new AppError(401, 'Invalid email or password');
  }

  // Registered through Google and never set a password, so there is no hash to
  // verify against. Deliberately the same generic error as above: a distinct
  // "this account uses Google" reply would tell an attacker which emails have
  // accounts, which is exactly what the generic error exists to prevent. The
  // login page carries a standing hint instead, which reveals nothing.
  if (!user.password) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(
      423,
      `Account locked after too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
    );
  }

  const valid = await argon2.verify(user.password, input.password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;
    await userRepository.recordFailedLogin(user.id, attempts, lockedUntil);
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await userRepository.clearFailedLogins(user.id);
  }

  return {
    user: { ...toPublicUser(user), tokenVersion: user.tokenVersion },
    mfaRequired: user.mfaEnabled,
  };
}

export interface GoogleLoginResult extends LoginResult {
  /** True when this call created the account, so it can be audited as a signup. */
  created: boolean;
  /** True when an existing password account gained a Google identity. */
  linked: boolean;
}

/**
 * Signs in with a verified Google identity, creating or linking as needed.
 *
 * Matching is by Google's `sub` first and email only as a fallback, because a
 * user can change their Gmail address but `sub` never changes — keying on email
 * alone would strand them with a duplicate account after a rename.
 */
export async function loginWithGoogle(identity: GoogleIdentity): Promise<GoogleLoginResult> {
  const byGoogleId = await userRepository.findByGoogleId(identity.googleId);
  if (byGoogleId) {
    return {
      user: { ...toPublicUser(byGoogleId), tokenVersion: byGoogleId.tokenVersion },
      mfaRequired: byGoogleId.mfaEnabled,
      created: false,
      linked: false,
    };
  }

  const byEmail = await userRepository.findByEmail(identity.email);
  if (byEmail) {
    // Linking hands control of an existing account to whoever holds this Google
    // login, so Google must have actually proven the mailbox. Without this check
    // a Workspace account with an unverified alias could claim someone's account.
    if (!identity.emailVerified) {
      throw new AppError(
        403,
        'Your Google account has not verified this email address, so it cannot be linked to an existing TrailWear account.'
      );
    }

    const linked = await userRepository.linkGoogle(byEmail.id, identity.googleId);
    return {
      user: { ...toPublicUser(linked), tokenVersion: linked.tokenVersion },
      mfaRequired: linked.mfaEnabled,
      created: false,
      linked: true,
    };
  }

  if (!identity.emailVerified) {
    throw new AppError(
      403,
      'Your Google account has not verified this email address, so it cannot be used to sign in.'
    );
  }

  const created = await userRepository.createWithGoogle({
    email: identity.email,
    googleId: identity.googleId,
    name: identity.name,
  });

  return {
    user: { ...toPublicUser(created), tokenVersion: created.tokenVersion },
    // A brand new account cannot have MFA yet, but this is read from the record
    // rather than hardcoded false so it stays correct if that ever changes.
    mfaRequired: created.mfaEnabled,
    created: true,
    linked: false,
  };
}

/** Completes login after the second factor has been proven. */
export async function issueSessionFor(userId: string): Promise<AuthedUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return { ...toPublicUser(user), tokenVersion: user.tokenVersion };
}

/** Bumps tokenVersion so every JWT issued to this user stops validating. */
export async function logout(userId: string): Promise<void> {
  await userRepository.incrementTokenVersion(userId);
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toPublicUser(user);
}
