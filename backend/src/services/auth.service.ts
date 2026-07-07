import argon2 from 'argon2';
import * as userRepository from '../repositories/user.repository';
import { toPublicUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import type { LoginDto, RegisterDto } from '../dtos/auth.dto';
import type { PublicUser } from '../types/user.types';

export async function register(input: RegisterDto): Promise<PublicUser> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const hashed = await argon2.hash(input.password);
  const user = await userRepository.create({
    email: input.email,
    password: hashed,
    name: input.name,
  });

  return toPublicUser(user);
}

export async function login(input: LoginDto): Promise<PublicUser> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await argon2.verify(user.password, input.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  return toPublicUser(user);
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toPublicUser(user);
}
