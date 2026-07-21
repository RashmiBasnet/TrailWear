import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as captchaService from '../services/captcha.service';
import * as auditService from '../services/audit.service';
import * as googleService from '../services/google.service';
import * as emailVerificationService from '../services/emailVerification.service';
import * as passwordResetService from '../services/passwordReset.service';
import {
  googleCallbackSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../dtos/auth.dto';
import { forgotPasswordSchema, resetPasswordSchema } from '../dtos/password.dto';
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
  const { tokenVersion, emailVerified, ...user } = await authService.register(input);

  await auditService.record(req, { action: 'REGISTER', entity: 'Auth', userId: user.id });

  if (!emailVerified) {
    res.status(201).json({
      success: true,
      data: { user, emailVerificationRequired: true },
    });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, tokenVersion });
  setAuthCookie(res, token);

  res.status(201).json({ success: true, data: { user, emailVerificationRequired: false } });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.body);
  await emailVerificationService.verify(token);

  await auditService.record(req, { action: 'EMAIL_VERIFIED', entity: 'Auth', userId: null });

  res.json({ success: true, message: 'Your email has been verified. You can now log in.' });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = resendVerificationSchema.parse(req.body);
  await emailVerificationService.resend(email);

  res.json({
    success: true,
    message: 'If that address needs verifying, a new link is on its way.',
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  await passwordResetService.requestReset(email);

  await auditService.record(req, {
    action: 'PASSWORD_RESET_REQUESTED',
    entity: 'Auth',
    userId: null,
    metadata: { email },
  });

  res.json({
    success: true,
    message: 'If that address has an account, a reset link is on its way.',
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  const userId = await passwordResetService.resetPassword(token, newPassword);

  await auditService.record(req, { action: 'PASSWORD_RESET', entity: 'Auth', userId });

  res.json({
    success: true,
    message: 'Your password has been reset. You can now log in with your new password.',
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const ip = req.ip;

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
      const unverified = err.statusCode === 403;

      await auditService.record(req, {
        action: unverified ? 'LOGIN_UNVERIFIED' : locked ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
        entity: 'Auth',
        userId: null,
        metadata: { email: input.email },
      });

      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(unverified ? { data: { emailVerificationRequired: true } } : {}),
      });
      return;
    }

    throw err;
  }
}

export async function googleStart(_req: Request, res: Response) {
  const state = signOAuthStateToken();
  setOAuthStateCookie(res, state);
  res.json({ success: true, data: { url: googleService.getAuthUrl(state) } });
}

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

  clearOAuthStateCookie(res);

  try {
    const identity = await googleService.exchangeCode(code);
    const { user: authed, mfaRequired, created, linked, reclaimed } =
      await authService.loginWithGoogle(identity);
    const { tokenVersion, ...user } = authed;

    if (reclaimed) {
      await auditService.record(req, {
        action: 'ACCOUNT_RECLAIMED',
        entity: 'Auth',
        userId: user.id,
        metadata: { reason: 'unverified_account_claimed_by_verified_google_identity' },
      });
    }

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
