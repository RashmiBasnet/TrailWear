import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const key = Buffer.from(env.DATA_ENCRYPTION_KEY, 'hex');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

/**
 * Whether a stored value is already in the `iv:authTag:ciphertext` form this
 * module produces. Only for the one-off backfill of rows written before a field
 * was encrypted — it makes that script safe to re-run. Never use it to decide
 * whether to decrypt at read time: that would let anyone who can write to the
 * database swap ciphertext for plaintext and have it served back verbatim.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  if (parts.length !== 3) return false;

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');

  return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
}

export function decrypt(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted payload');
  }

  const [ivB64, authTagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Malformed encrypted payload');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
