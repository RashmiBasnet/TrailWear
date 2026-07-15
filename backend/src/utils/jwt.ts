import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env';
import type { Role } from '../types/user.types';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: Role;
  tokenVersion: number;
}

const COOKIE_NAME = 'token';

/**
 * Converts a jsonwebtoken-style duration ('30d', '12h', '900') to milliseconds.
 * The cookie lifetime is derived from JWT_EXPIRES_IN rather than hardcoded, so
 * the cookie and the token it carries can never expire at different times.
 */
function durationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
  }
  const factors: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * factors[match[2] ?? 's'];
}

const COOKIE_MAX_AGE_MS = durationToMs(env.JWT_EXPIRES_IN);

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as AuthTokenPayload;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}
