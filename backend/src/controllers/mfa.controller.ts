import type { Request, Response } from 'express';
import * as mfaService from '../services/mfa.service';
import * as authService from '../services/auth.service';
import * as auditService from '../services/audit.service';
import { mfaBackupCodeSchema, mfaCodeSchema, mfaDisableSchema } from '../dtos/mfa.dto';
import { AppError } from '../utils/AppError';
import {
  MFA_PENDING_COOKIE,
  clearMfaPendingCookie,
  setAuthCookie,
  signToken,
  verifyMfaPendingToken,
} from '../utils/jwt';

/** Resolves the half-authenticated user from the short-lived pending cookie. */
function requirePendingUser(req: Request): string {
  const token = req.cookies?.[MFA_PENDING_COOKIE] as string | undefined;
  if (!token) {
    throw new AppError(401, 'Your login session expired. Please sign in again.');
  }
  try {
    return verifyMfaPendingToken(token).id;
  } catch {
    throw new AppError(401, 'Your login session expired. Please sign in again.');
  }
}

/** Completes login: swap the pending cookie for a real session. */
async function completeLogin(res: Response, userId: string) {
  const { tokenVersion, ...user } = await authService.issueSessionFor(userId);
  clearMfaPendingCookie(res);
  setAuthCookie(res, signToken({ id: user.id, email: user.email, role: user.role, tokenVersion }));
  return user;
}

export async function status(req: Request, res: Response) {
  res.json({ success: true, data: await mfaService.status(req.user!.id) });
}

export async function setup(req: Request, res: Response) {
  const { qrCode, secret } = await mfaService.setup(req.user!.id);
  res.json({ success: true, data: { qrCode, secret } });
}

export async function enable(req: Request, res: Response) {
  const { code } = mfaCodeSchema.parse(req.body);
  const { backupCodes } = await mfaService.enable(req.user!.id, code);
  await auditService.record(req, { action: 'MFA_ENABLED', entity: 'Auth' });
  res.json({ success: true, data: { backupCodes } });
}

export async function disable(req: Request, res: Response) {
  const { password, code } = mfaDisableSchema.parse(req.body);
  await mfaService.disable(req.user!.id, password, code);
  await auditService.record(req, { action: 'MFA_DISABLED', entity: 'Auth' });
  res.json({ success: true, message: 'Two-factor authentication disabled' });
}

/** Second step of login, using an authenticator code. */
export async function verify(req: Request, res: Response) {
  const { code } = mfaCodeSchema.parse(req.body);
  const userId = requirePendingUser(req);

  try {
    await mfaService.verifyCode(userId, code);
  } catch (err) {
    // A correct password followed by failing codes is worth seeing in the trail.
    await auditService.record(req, { action: 'MFA_FAILED', entity: 'Auth', userId });
    throw err;
  }

  const user = await completeLogin(res, userId);
  await auditService.record(req, { action: 'LOGIN', entity: 'Auth', userId, metadata: { mfa: 'totp' } });
  res.json({ success: true, data: { user } });
}

/** Second step of login, using a single-use backup code. */
export async function verifyBackup(req: Request, res: Response) {
  const { code } = mfaBackupCodeSchema.parse(req.body);
  const userId = requirePendingUser(req);

  let backupCodesLeft: number;
  try {
    backupCodesLeft = await mfaService.verifyBackupCode(userId, code);
  } catch (err) {
    await auditService.record(req, { action: 'MFA_FAILED', entity: 'Auth', userId, metadata: { mfa: 'backup' } });
    throw err;
  }

  const user = await completeLogin(res, userId);
  await auditService.record(req, {
    action: 'MFA_BACKUP_USED',
    entity: 'Auth',
    userId,
    metadata: { backupCodesLeft },
  });
  res.json({ success: true, data: { user, backupCodesLeft } });
}
