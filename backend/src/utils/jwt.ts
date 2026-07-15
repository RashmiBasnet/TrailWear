import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env';
import type { Role } from '../types/user.types';

/**
 * Every token carries a `typ` claim and every verifier checks it. Without this,
 * the short-lived MFA-pending token — signed with the same secret — could simply
 * be replayed as the session cookie and skip the second factor entirely.
 */
const TOKEN_TYPE_SESSION = 'session';
const TOKEN_TYPE_MFA_PENDING = 'mfa_pending';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: Role;
  tokenVersion: number;
}

export interface MfaPendingPayload {
  id: string;
}

const COOKIE_NAME = 'token';
const MFA_COOKIE_NAME = 'mfa_pending';

/** Window to finish the second step. Short, because the password is already accepted. */
const MFA_PENDING_EXPIRES_IN = '5m';
const MFA_PENDING_MAX_AGE_MS = 5 * 60 * 1000;

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

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
} as const;

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign({ ...payload, typ: TOKEN_TYPE_SESSION }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload & { typ?: string };
  if (decoded.typ !== TOKEN_TYPE_SESSION) {
    throw new Error('Wrong token type');
  }
  return decoded;
}

/** Issued once the password checks out but before the second factor is proven. */
export function signMfaPendingToken(payload: MfaPendingPayload): string {
  return jwt.sign({ ...payload, typ: TOKEN_TYPE_MFA_PENDING }, env.JWT_SECRET, {
    expiresIn: MFA_PENDING_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyMfaPendingToken(token: string): MfaPendingPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as MfaPendingPayload & { typ?: string };
  if (decoded.typ !== TOKEN_TYPE_MFA_PENDING) {
    throw new Error('Wrong token type');
  }
  return decoded;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, { ...baseCookieOptions, maxAge: COOKIE_MAX_AGE_MS });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
}

export function setMfaPendingCookie(res: Response, token: string): void {
  res.cookie(MFA_COOKIE_NAME, token, { ...baseCookieOptions, maxAge: MFA_PENDING_MAX_AGE_MS });
}

export function clearMfaPendingCookie(res: Response): void {
  res.clearCookie(MFA_COOKIE_NAME, baseCookieOptions);
}

export const MFA_PENDING_COOKIE = MFA_COOKIE_NAME;
