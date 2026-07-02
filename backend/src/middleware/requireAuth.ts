import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
