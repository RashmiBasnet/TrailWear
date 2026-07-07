import * as userRepository from '../repositories/user.repository';
import { toPublicUser } from '../models/user.model';
import type { PublicUser } from '../types/user.types';

export async function listUsers(): Promise<PublicUser[]> {
  const users = await userRepository.findAll();
  return users.map(toPublicUser);
}
