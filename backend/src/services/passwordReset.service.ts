import crypto from 'crypto';
import argon2 from 'argon2';
import * as resetRepository from '../repositories/passwordReset.repository';
import * as verificationRepository from '../repositories/emailVerification.repository';
import * as userRepository from '../repositories/user.repository';
import * as historyRepository from '../repositories/passwordHistory.repository';
import { sendEmail, isConfigured } from '../config/email';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';
import { isStrongEnough } from '../utils/passwordStrength';
import { PASSWORD_HISTORY_COUNT } from './password.service';

const TOKEN_TTL_MS = 60 * 60 * 1000;

const MAX_REQUESTS_PER_HOUR = 5;

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isEmailEnabled(): boolean {
  return isConfigured();
}

export async function requestReset(email: string): Promise<void> {
  if (!isEmailEnabled()) {
    logger.warn('Password reset requested but SMTP is not configured — no email sent.');
    return;
  }

  const user = await userRepository.findByEmail(email);

  if (!user || !user.password) {
    return;
  }

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await resetRepository.countRecent(user.id, since);
  if (recent >= MAX_REQUESTS_PER_HOUR) {
    logger.warn('Password reset throttled', { userId: user.id });
    return;
  }

  await resetRepository.invalidateAllForUser(user.id);

  const token = generateToken();
  await resetRepository.create({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  try {
    await sendEmail(
      user.email,
      'Reset your TrailWear password',
      resetEmailHtml(user.name, link),
      resetEmailText(user.name, link)
    );
  } catch (err) {
    logger.warn('Password reset email failed to send', {
      userId: user.id,
      reason: err instanceof Error ? err.message : 'unknown',
    });
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const record = await resetRepository.findByTokenHash(hashToken(token));

  const invalid = () => new AppError(400, 'This reset link is invalid or has expired.');

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw invalid();
  }

  const user = record.user;

  const strength = isStrongEnough(newPassword, [user.email, user.name, 'trailwear']);
  if (!strength.ok) {
    throw new AppError(
      400,
      strength.warning || 'That password is too easy to guess. Try a longer or less common one.'
    );
  }

  if (user.password && (await argon2.verify(user.password, newPassword))) {
    throw new AppError(400, 'Your new password must be different from your current one');
  }

  const history = await historyRepository.findRecent(user.id, PASSWORD_HISTORY_COUNT);
  for (const entry of history) {
    if (await argon2.verify(entry.hash, newPassword)) {
      throw new AppError(400, `You cannot reuse any of your last ${PASSWORD_HISTORY_COUNT} passwords`);
    }
  }

  const hash = await argon2.hash(newPassword);

  await resetRepository.markUsed(record.id);
  await resetRepository.invalidateAllForUser(user.id);

  if (user.password) {
    await historyRepository.add(user.id, user.password);
  }

  await userRepository.updatePassword(user.id, hash);

  await userRepository.clearFailedLogins(user.id);
  if (!user.emailVerified) {
    await verificationRepository.markUserVerified(user.id);
  }

  await historyRepository.trim(user.id, PASSWORD_HISTORY_COUNT);

  return user.id;
}

const BRAND = '#1e3a5f';

function resetEmailHtml(name: string, link: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:${BRAND};padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:0.2px;">TrailWear</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600;">Reset your password</h2>
                <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                  Hi ${escapeHtml(name)}, we received a request to reset the password on
                  your TrailWear account. Choose a new one using the button below.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:999px;background:${BRAND};">
                      <a href="${link}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
                        Reset my password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;color:${BRAND};font-size:13px;word-break:break-all;">${link}</p>

                <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
                  This link expires in 1 hour and can only be used once.
                  If you didn't request a password reset, you can ignore this email —
                  your password will not change until the link is used.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">© TrailWear</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function resetEmailText(name: string, link: string): string {
  return `Hi ${name},

We received a request to reset the password on your TrailWear account. Choose a
new one by opening the link below:

${link}

This link expires in 1 hour and can only be used once.

If you didn't request a password reset, you can ignore this email — your
password will not change until the link is used.

- TrailWear`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
