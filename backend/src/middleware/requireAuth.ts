import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import * as userRepository from '../repositories/user.repository';

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  const user = await userRepository.findById(payload.id);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    res.status(401).json({ success: false, message: 'Session expired, please log in again' });
    return;
  }

  req.user = { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
  next();
};
