import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import * as verificationRepository from '../repositories/emailVerification.repository';
import * as emailVerificationService from './emailVerification.service';
import { env } from '../config/env';
import { logger } from '../config/logger';
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

export interface RegisterResult extends AuthedUser {
  emailVerified: boolean;
}

export interface LoginResult {
  user: AuthedUser;
  mfaRequired: boolean;
}

export async function register(input: RegisterDto): Promise<RegisterResult> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const strength = isStrongEnough(input.password, [input.email, input.name, 'trailwear']);
  if (!strength.ok) {
    throw new AppError(
      400,
      strength.warning || 'That password is too easy to guess. Try a longer or less common one.'
    );
  }

  if (!emailVerificationService.isEmailEnabled() && env.NODE_ENV === 'production') {
    throw new AppError(503, 'Registration is temporarily unavailable. Please try again later.');
  }

  const hashed = await argon2.hash(input.password);
  const user = await userRepository.create({
    email: input.email,
    password: hashed,
    name: input.name,
  });

  if (!emailVerificationService.isEmailEnabled()) {
    logger.warn(
      'SMTP is not configured — new account auto-verified without proving its email. Set SMTP_USER and SMTP_PASS.',
      { userId: user.id }
    );
    await verificationRepository.markUserVerified(user.id);
    return { ...toPublicUser(user), tokenVersion: user.tokenVersion, emailVerified: true };
  }

  await emailVerificationService.sendVerificationEmail(user.id, user.email, user.name);
  return { ...toPublicUser(user), tokenVersion: user.tokenVersion, emailVerified: false };
}

export async function login(input: LoginDto): Promise<LoginResult> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

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

  if (!user.emailVerified) {
    throw new AppError(403, 'Please verify your email address before logging in.');
  }

  return {
    user: { ...toPublicUser(user), tokenVersion: user.tokenVersion },
    mfaRequired: user.mfaEnabled,
  };
}

export interface GoogleLoginResult extends LoginResult {
  created: boolean;
  linked: boolean;
  reclaimed: boolean;
}

export async function loginWithGoogle(identity: GoogleIdentity): Promise<GoogleLoginResult> {
  const byGoogleId = await userRepository.findByGoogleId(identity.googleId);
  if (byGoogleId) {
    return {
      user: { ...toPublicUser(byGoogleId), tokenVersion: byGoogleId.tokenVersion },
      mfaRequired: byGoogleId.mfaEnabled,
      created: false,
      linked: false,
      reclaimed: false,
    };
  }

  const byEmail = await userRepository.findByEmail(identity.email);
  if (byEmail) {
    if (!identity.emailVerified) {
      throw new AppError(
        403,
        'Your Google account has not verified this email address, so it cannot be linked to an existing TrailWear account.'
      );
    }

    if (!byEmail.emailVerified) {
      const reclaimed = await userRepository.linkGoogleAndReclaim(byEmail.id, identity.googleId);
      return {
        user: { ...toPublicUser(reclaimed), tokenVersion: reclaimed.tokenVersion },
        mfaRequired: reclaimed.mfaEnabled,
        created: false,
        linked: true,
        reclaimed: true,
      };
    }

    const linked = await userRepository.linkGoogle(byEmail.id, identity.googleId);
    return {
      user: { ...toPublicUser(linked), tokenVersion: linked.tokenVersion },
      mfaRequired: linked.mfaEnabled,
      created: false,
      linked: true,
      reclaimed: false,
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
    mfaRequired: created.mfaEnabled,
    created: true,
    linked: false,
    reclaimed: false,
  };
}

export async function issueSessionFor(userId: string): Promise<AuthedUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return { ...toPublicUser(user), tokenVersion: user.tokenVersion };
}

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
