import { env } from '../config/env';
import { logger } from '../config/logger';

const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

const GOOGLE_TEST_SECRET = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

export function isUsingTestKeys(): boolean {
  return env.RECAPTCHA_SECRET_KEY === GOOGLE_TEST_SECRET;
}

export async function verifyToken(token: string, ip?: string): Promise<boolean> {
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
    if (ip) body.append('remoteip', ip);

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      logger.error('reCAPTCHA siteverify returned an error status', { status: response.status });
      return false;
    }

    const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      logger.warn('reCAPTCHA verification rejected', { errors: result['error-codes'] });
    }
    return result.success === true;
  } catch (err) {
    logger.error('reCAPTCHA verification failed to reach Google', { err });
    return false;
  }
}
