import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as captchaService from '../services/captcha.service';
import * as auditService from '../services/audit.service';
import * as googleService from '../services/google.service';
import { googleCallbackSchema, loginSchema, registerSchema } from '../dtos/auth.dto';
import { AppError } from '../utils/AppError';
import {
  clearAuthCookie,
  clearMfaPendingCookie,
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  setAuthCookie,
  setMfaPendingCookie,
  setOAuthStateCookie,
  signMfaPendingToken,
  signOAuthStateToken,
  signToken,
  verifyOAuthStateToken,
} from '../utils/jwt';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { tokenVersion, ...user } = await authService.register(input);

  const token = signToken({ id: user.id, email: user.email, role: user.role, tokenVersion });
  setAuthCookie(res, token);

  await auditService.record(req, { action: 'REGISTER', entity: 'Auth', userId: user.id });

  res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const ip = req.ip;

  // Checked before the password, on every attempt: a guess that never reaches
  // the password check costs the attacker a solved challenge each time.
  const passed = await captchaService.verifyToken(input.captchaToken ?? '', ip);
  if (!passed) {
    await auditService.record(req, {
      action: 'CAPTCHA_FAILED',
      entity: 'Auth',
      userId: null,
      metadata: { email: input.email },
    });
    res.status(400).json({
      success: false,
      message: 'Please complete the captcha to continue.',
    });
    return;
  }

  try {
    const { user: authed, mfaRequired } = await authService.login(input);
    const { tokenVersion, ...user } = authed;

    // With MFA on, a correct password alone must not produce a session. Issue a
    // short-lived pending token instead; only /mfa/verify can trade it for one.
    if (mfaRequired) {
      setMfaPendingCookie(res, signMfaPendingToken({ id: user.id }));
      res.json({ success: true, data: { mfaRequired: true } });
      return;
    }

    setAuthCookie(res, signToken({ id: user.id, email: user.email, role: user.role, tokenVersion }));
    await auditService.record(req, { action: 'LOGIN', entity: 'Auth', userId: user.id });

    res.json({ success: true, data: { user, mfaRequired: false } });
  } catch (err) {
    if (err instanceof AppError) {
      const locked = err.statusCode === 423;
      await auditService.record(req, {
        action: locked ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
        entity: 'Auth',
        userId: null,
        // The attempted email is recorded; the password never is.
        metadata: { email: input.email },
      });

      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }

    throw err;
  }
}

/**
 * Step 1 of Google sign-in: hands back the consent screen URL to redirect to,
 * plus a signed `state` in a cookie to match when the user comes back.
 *
 * Returns JSON rather than redirecting because the browser never reaches this
 * API directly — the Next server calls it and owns the browser's cookies (see
 * the note on the callback below).
 */
export async function googleStart(_req: Request, res: Response) {
  const state = signOAuthStateToken();
  setOAuthStateCookie(res, state);
  res.json({ success: true, data: { url: googleService.getAuthUrl(state) } });
}

/**
 * Step 2: trades the authorization code Google handed back for a session.
 *
 * Google redirects the browser to the *frontend*, not here, because the session
 * cookie has to end up on the frontend's origin — that is the only place the app
 * reads it from. The Next route handler forwards the code here and relays the
 * cookies set below, exactly as it already does for password login.
 */
export async function googleCallback(req: Request, res: Response) {
  const fail = async (reason: string, status: number, message: string) => {
    clearOAuthStateCookie(res);
    await auditService.record(req, {
      action: 'GOOGLE_LOGIN_FAILED',
      entity: 'Auth',
      userId: null,
      metadata: { reason },
    });
    res.status(status).json({ success: false, message });
  };

  const { code, state } = googleCallbackSchema.parse(req.body);
  const stateCookie = req.cookies?.[OAUTH_STATE_COOKIE];

  // The state returned by Google must match the one issued at step 1 and still
  // held by this browser. That match is what proves this callback answers a
  // sign-in this browser actually started, rather than an authorization code
  // injected by an attacker to log the victim into the attacker's account.
  if (typeof stateCookie !== 'string' || state !== stateCookie) {
    await fail('state_mismatch', 400, 'Google sign-in could not be verified. Please try again.');
    return;
  }

  try {
    verifyOAuthStateToken(stateCookie);
  } catch {
    await fail('state_invalid', 400, 'Your Google sign-in took too long. Please try again.');
    return;
  }

  // Single use: consumed now, so a replayed callback cannot pass the check above.
  clearOAuthStateCookie(res);

  try {
    const identity = await googleService.exchangeCode(code);
    const { user: authed, mfaRequired, created, linked } =
      await authService.loginWithGoogle(identity);
    const { tokenVersion, ...user } = authed;

    // Google proving who someone is does not substitute for the second factor
    // they deliberately turned on. Same pending-token handoff as the password
    // flow, so /mfa/verify stays the only route to a session.
    if (mfaRequired) {
      setMfaPendingCookie(res, signMfaPendingToken({ id: user.id }));
      res.json({ success: true, data: { mfaRequired: true } });
      return;
    }

    setAuthCookie(res, signToken({ id: user.id, email: user.email, role: user.role, tokenVersion }));

    await auditService.record(req, {
      action: created ? 'GOOGLE_REGISTER' : 'GOOGLE_LOGIN',
      entity: 'Auth',
      userId: user.id,
      // Linking attaches a new way into an existing account, so it is recorded
      // as its own fact rather than left to be inferred later.
      metadata: linked ? { linkedExistingAccount: true } : undefined,
    });

    res.json({ success: true, data: { user, mfaRequired: false } });
  } catch (err) {
    if (err instanceof AppError) {
      await fail(`error_${err.statusCode}`, err.statusCode, err.message);
      return;
    }
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.user!.id);
  await auditService.record(req, { action: 'LOGOUT', entity: 'Auth' });
  clearAuthCookie(res);
  clearMfaPendingCookie(res);
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.json({ success: true, data: { user } });
}
