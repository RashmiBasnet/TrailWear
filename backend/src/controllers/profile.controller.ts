import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { createAddressSchema, updateProfileSchema } from '../dtos/profile.dto';

export async function getProfile(req: Request, res: Response) {
  const user = await profileService.getProfile(req.user!.id);
  res.json({ success: true, data: { user } });
}

export async function updateProfile(req: Request, res: Response) {
  const { name } = updateProfileSchema.parse(req.body);
  const user = await profileService.updateName(req.user!.id, name);
  res.json({ success: true, data: { user } });
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
