import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { loginSchema, registerSchema } from '../dtos/auth.dto';
import {
  clearAuthCookie,
  clearMfaPendingCookie,
  setAuthCookie,
  setMfaPendingCookie,
  signMfaPendingToken,
  signToken,
} from '../utils/jwt';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { tokenVersion, ...user } = await authService.register(input);

  const token = signToken({ id: user.id, email: user.email, role: user.role, tokenVersion });
  setAuthCookie(res, token);

  res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { user: authed, mfaRequired } = await authService.login(input);
  const { tokenVersion, ...user } = authed;

  // With MFA on, a correct password alone must not produce a session. Issue a
  // short-lived pending token instead; only /mfa/verify can trade it for one.
  if (mfaRequired) {
    setMfaPendingCookie(res, signMfaPendingToken({ id: user.id }));
    res.json({ success: true, data: { mfaRequired: true } });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, tokenVersion });
  setAuthCookie(res, token);

  res.json({ success: true, data: { user, mfaRequired: false } });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.user!.id);
  clearAuthCookie(res);
  clearMfaPendingCookie(res);
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.json({ success: true, data: { user } });
}
