import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * Google OAuth 2.0 authorization code flow.
 *
 * The code-for-token exchange happens here on the server, authenticated with the
 * client secret. The browser only ever carries the authorization code, which is
 * single-use and worthless without that secret.
 */

export interface GoogleIdentity {
  /** Google's `sub` claim — the stable account identifier. */
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

/** Google routes are wired up but inert until credentials are configured. */
export function isConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function getClient(): OAuth2Client {
  if (!isConfigured()) {
    throw new AppError(503, 'Google sign-in is not configured on this server');
  }
  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_CALLBACK_URL,
  });
}

/**
 * The consent screen URL to send the browser to.
 *
 * `state` is echoed back by Google on the callback and matched against a cookie,
 * which is what stops an attacker from feeding their own authorization code into
 * a victim's callback and quietly logging the victim into the attacker's account.
 */
export function getAuthUrl(state: string): string {
  return getClient().generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    state,
    // No refresh token is wanted: this is sign-in only, not ongoing access to
    // the user's Google data, so there is nothing to keep offline.
    access_type: 'online',
    // Google remembers a prior choice and silently reuses it. Asking every time
    // means someone on a shared machine can pick a different account.
    prompt: 'select_account',
  });
}

/**
 * Trades the authorization code for the caller's identity.
 *
 * The identity is read from the ID token, whose signature is verified against
 * Google's published keys and whose `aud` must be this client. An unverified
 * token is just a bag of attacker-supplied claims.
 */
export async function exchangeCode(code: string): Promise<GoogleIdentity> {
  const client = getClient();

  let idToken: string | null | undefined;
  try {
    const { tokens } = await client.getToken(code);
    idToken = tokens.id_token;
  } catch {
    // Expired, already used, or minted for a different client.
    throw new AppError(401, 'Google sign-in failed. Please try again.');
  }

  if (!idToken) {
    throw new AppError(401, 'Google sign-in failed. Please try again.');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID!,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new AppError(401, 'Google did not return an email address for this account.');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: payload.name || payload.email.split('@')[0],
  };
}
