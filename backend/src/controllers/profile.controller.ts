import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import * as auditService from '../services/audit.service';
import * as passwordService from '../services/password.service';
import * as authService from '../services/auth.service';
import { createAddressSchema, updateProfileSchema } from '../dtos/profile.dto';
import { changePasswordSchema } from '../dtos/password.dto';
import { setAuthCookie, signToken } from '../utils/jwt';

export async function getProfile(req: Request, res: Response) {
  const user = await profileService.getProfile(req.user!.id);
  res.json({ success: true, data: { user } });
}

export async function updateProfile(req: Request, res: Response) {
  const { name } = updateProfileSchema.parse(req.body);
  const user = await profileService.updateName(req.user!.id, name);
  await auditService.record(req, { action: 'PROFILE_UPDATED', entity: 'User', entityId: user.id });
  res.json({ success: true, data: { user } });
}

export async function changePassword(req: Request, res: Response) {
  const input = changePasswordSchema.parse(req.body);
  await passwordService.changePassword(req.user!.id, input);

  // The change invalidated every session, including this one. Re-issue a cookie
  // for the caller so they stay signed in while other devices are logged out.
  const { tokenVersion, ...user } = await authService.issueSessionFor(req.user!.id);
  setAuthCookie(res, signToken({ id: user.id, email: user.email, role: user.role, tokenVersion }));

  await auditService.record(req, { action: 'PASSWORD_CHANGED', entity: 'Auth' });

  res.json({
    success: true,
    message: 'Password updated. Other devices have been signed out.',
  });
}

/** Lets the profile page show how long the current password remains valid. */
export async function passwordStatus(req: Request, res: Response) {
  const status = await profileService.getPasswordStatus(req.user!.id);
  res.json({ success: true, data: status });
}

export async function addAddress(req: Request, res: Response) {
  const input = createAddressSchema.parse(req.body);
  const address = await profileService.addAddress(req.user!.id, input);
  res.status(201).json({ success: true, data: { address } });
}

export async function listAddresses(req: Request, res: Response) {
  const addresses = await profileService.listAddresses(req.user!.id);
  res.json({ success: true, data: { addresses } });
}
