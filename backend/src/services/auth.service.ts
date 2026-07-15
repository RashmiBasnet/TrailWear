import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import { toPublicUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import type { LoginDto, RegisterDto } from '../dtos/auth.dto';
import type { PublicUser } from '../types/user.types';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export interface AuthedUser extends PublicUser {
  tokenVersion: number;
}

export async function register(input: RegisterDto): Promise<AuthedUser> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const hashed = await argon2.hash(input.password);
  const user = await userRepository.create({
    email: input.email,
    password: hashed,
    name: input.name,
  });

  return { ...toPublicUser(user), tokenVersion: user.tokenVersion };
}

export async function login(input: LoginDto): Promise<AuthedUser> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    // Same generic error as a bad password, so this can't be used to
    // discover which emails have accounts.
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
