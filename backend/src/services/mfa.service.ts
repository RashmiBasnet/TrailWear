import crypto from 'crypto';
import argon2 from 'argon2';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin, generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import * as userRepository from '../repositories/user.repository';
import { encrypt, decrypt } from '../utils/crypto';
import { AppError } from '../utils/AppError';

const ISSUER = 'TrailWear';
const BACKUP_CODE_COUNT = 10;

/**
 * Accept codes from the neighbouring 30s window in each direction, to tolerate
 * clock drift between the server and the user's phone. Wider than this and a
 * stolen code stays usable for too long.
 */
const EPOCH_TOLERANCE_SECONDS = 30;

/**
 * The TOTP class takes no plugins by default (unlike otplib's functional API),
 * so the HMAC and Base32 implementations must be supplied explicitly or every
 * call throws CryptoPluginMissingError at runtime.
 */
const crypto32 = new NobleCryptoPlugin();
const base32 = new ScureBase32Plugin();

// Stateless; the secret is supplied per call.
const totp = new TOTP({ crypto: crypto32, base32 });

/**
 * Verifies a TOTP token against the user's secret.
 *
 * `afterTimeStep` is the replay guard: otplib rejects any token whose time step
 * is <= the last one we accepted. Without it a code stays valid for its whole
 * 30s window, so anyone who observed it could reuse it within that window.
 */
function checkToken(secret: string, token: string, afterTimeStep?: number | null) {
  return totp.verify(token, {
    secret,
    epochTolerance: EPOCH_TOLERANCE_SECONDS,
    ...(afterTimeStep != null ? { afterTimeStep } : {}),
  });
}

function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = crypto.randomBytes(4).toString('hex'); // 8 hex chars
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
}

/**
 * Step 1 of enrolment: generate a secret and return it as a QR code.
 * MFA is NOT switched on here — the user must first prove they can produce a
 * valid code, otherwise a misscanned QR would lock them out of their account.
 */
export async function setup(userId: string): Promise<{ qrCode: string; secret: string }> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.mfaEnabled) {
    throw new AppError(409, 'Two-factor authentication is already enabled');
  }

  const secret = generateSecret();
  const otpauth = generateURI({ strategy: 'totp', issuer: ISSUER, label: user.email, secret });

  await userRepository.setMfaSecret(userId, encrypt(secret));

  return { qrCode: await QRCode.toDataURL(otpauth), secret };
}

/** Step 2 of enrolment: confirm the app produces correct codes, then enable MFA. */
export async function enable(userId: string, code: string): Promise<{ backupCodes: string[] }> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.mfaEnabled) {
    throw new AppError(409, 'Two-factor authentication is already enabled');
  }
  if (!user.mfaSecret) {
    throw new AppError(400, 'Start two-factor setup first');
  }

  const result = await checkToken(decrypt(user.mfaSecret), code);
  if (!result.valid) {
    throw new AppError(400, 'That code is not valid. Check your authenticator app and try again.');
  }

  const backupCodes = generateBackupCodes();
  const hashes = await Promise.all(backupCodes.map((c) => argon2.hash(c)));
  await userRepository.enableMfa(userId, hashes, result.timeStep);

  // Returned once, in plaintext, and never again — only hashes are stored.
  return { backupCodes };
}

/** Verifies a TOTP code during login, rejecting replays. */
export async function verifyCode(userId: string, code: string): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw new AppError(400, 'Two-factor authentication is not enabled');
  }

  const result = await checkToken(decrypt(user.mfaSecret), code, user.mfaLastUsedStep);
  if (!result.valid) {
    throw new AppError(401, 'Invalid or already used authentication code');
  }

  await userRepository.setMfaLastUsedStep(userId, result.timeStep);
}

/** Consumes a single-use backup code, returning how many remain. */
export async function verifyBackupCode(userId: string, code: string): Promise<number> {
  const user = await userRepository.findById(userId);
  if (!user || !user.mfaEnabled) {
    throw new AppError(400, 'Two-factor authentication is not enabled');
  }

  const normalised = code.trim().toLowerCase();
  for (const hash of user.mfaBackupCodes) {
    if (await argon2.verify(hash, normalised)) {
      const remaining = user.mfaBackupCodes.filter((h) => h !== hash);
      await userRepository.setBackupCodes(userId, remaining);
      return remaining.length;
    }
  }

  throw new AppError(401, 'Invalid backup code');
}

/**
 * Turning MFA off requires the password AND a current code: a hijacked session
 * alone must not be enough to strip the second factor. Google-only accounts have
 * no password, so for those the code alone stands (see below).
 */
export async function disable(
  userId: string,
  password: string | undefined,
  code: string
): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (!user.mfaEnabled || !user.mfaSecret) {
    throw new AppError(400, 'Two-factor authentication is not enabled');
  }

  // A Google-only account has no password to demand. The current code below is
  // then the sole proof — weaker than password-plus-code, but it is the strongest
  // proof such an account can give, and refusing outright would leave the user
  // unable to ever turn MFA off.
  if (user.password) {
    if (!password || !(await argon2.verify(user.password, password))) {
      throw new AppError(401, 'Incorrect password');
    }
  }
  if (!(await checkToken(decrypt(user.mfaSecret), code)).valid) {
    throw new AppError(401, 'Invalid authentication code');
  }

  await userRepository.disableMfa(userId);
}

export async function status(userId: string): Promise<{ enabled: boolean; backupCodesLeft: number }> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return { enabled: user.mfaEnabled, backupCodesLeft: user.mfaBackupCodes.length };
}
