import crypto from 'crypto';
import * as verificationRepository from '../repositories/emailVerification.repository';
import * as userRepository from '../repositories/user.repository';
import { sendEmail, isConfigured } from '../config/email';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

/**
 * Long enough to survive a mail delay or a user who reads it that evening, short
 * enough that an old link found in an inbox years later is inert.
 */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Re-sends allowed per user per hour, so the endpoint cannot be used to spam an inbox. */
const MAX_SENDS_PER_HOUR = 5;

/**
 * 32 bytes of CSPRNG output. The link is a bearer credential, so it has to be
 * unguessable on its own — an incrementing id or a timestamp would be forgeable.
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Tokens are stored hashed; the raw value exists only in the email. */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isEmailEnabled(): boolean {
  return isConfigured();
}

/**
 * Issues a fresh link and emails it.
 *
 * Any previous link is retired first: a re-send should mean the older email
 * stops working, not that both do.
 */
export async function sendVerificationEmail(userId: string, email: string, name: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await verificationRepository.countRecent(userId, since);
  if (recent >= MAX_SENDS_PER_HOUR) {
    throw new AppError(429, 'Too many verification emails requested. Please try again later.');
  }

  await verificationRepository.invalidateAllForUser(userId);

  const token = generateToken();
  await verificationRepository.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your TrailWear email',
    verificationEmailHtml(name, link),
    verificationEmailText(name, link)
  );
}

/**
 * Redeems a link.
 *
 * Every failure returns the same message. The token is the only secret involved,
 * so distinguishing "expired" from "already used" from "never existed" would
 * describe the state of someone else's account to whoever holds a guess.
 */
export async function verify(token: string): Promise<void> {
  const record = await verificationRepository.findByTokenHash(hashToken(token));

  const invalid = () => new AppError(400, 'This verification link is invalid or has expired.');

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw invalid();
  }

  // Single use, marked before the account changes so two clicks in flight at
  // once cannot both proceed.
  await verificationRepository.markUsed(record.id);
  await verificationRepository.markUserVerified(record.userId);
}

/**
 * Re-sends to an address that may or may not have an account.
 *
 * Deliberately never reports whether it did: this endpoint is unauthenticated,
 * so a truthful answer would turn it into an account-existence oracle — the same
 * reason login returns a generic error.
 */
export async function resend(email: string): Promise<void> {
  const user = await userRepository.findByEmail(email);
  if (!user || user.emailVerified) {
    return;
  }

  try {
    await sendVerificationEmail(user.id, user.email, user.name);
  } catch (err) {
    // A throttled or failed re-send must not surface either, for the same
    // reason: the difference would be observable.
    logger.warn('Verification re-send failed', {
      userId: user.id,
      reason: err instanceof Error ? err.message : 'unknown',
    });
  }
}

const BRAND = '#1e3a5f';

function verificationEmailHtml(name: string, link: string): string {
  // Table-based layout with inline styles: mail clients strip <style> blocks and
  // have no flexbox, so anything more modern collapses in Outlook and Gmail.
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
                <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600;">Confirm your email</h2>
                <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                  Hi ${escapeHtml(name)}, thanks for creating a TrailWear account.
                  Confirm this address to finish setting it up.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:999px;background:${BRAND};">
                      <a href="${link}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
                        Verify my email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;color:${BRAND};font-size:13px;word-break:break-all;">${link}</p>

                <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
                  This link expires in 24 hours and can only be used once.
                  If you didn't create a TrailWear account, you can ignore this email —
                  nothing will happen until the link is used.
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

/** Plain-text alternative: some clients show it, and spam filters expect it. */
function verificationEmailText(name: string, link: string): string {
  return `Hi ${name},

Thanks for creating a TrailWear account. Confirm your email address by opening
the link below:

${link}

This link expires in 24 hours and can only be used once.

If you didn't create a TrailWear account, you can ignore this email.

- TrailWear`;
}

/**
 * The name is user-supplied and lands in an HTML document, so it is escaped.
 * Mail clients render HTML: an unescaped name is a scripting hole in someone
 * else's inbox, not just a formatting bug.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
