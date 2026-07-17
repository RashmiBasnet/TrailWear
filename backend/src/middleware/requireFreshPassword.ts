import type { RequestHandler } from 'express';
import * as userRepository from '../repositories/user.repository';
import { isPasswordExpired } from '../services/password.service';

/**
 * Blocks a session whose password has aged out, until it is changed.
 *
 * Enforced here rather than in the browser: a client-side prompt is only a
 * suggestion, and an expired account could keep using the API by ignoring it.
 * Mount after requireAuth, and only on routes the user should lose access to —
 * logout, /me and the change-password endpoint itself must stay reachable, or
 * the user would be locked out with no way to fix it.
 */
export const requireFreshPassword: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    next();
    return;
  }

  const user = await userRepository.findById(req.user.id);

  // Google-only accounts have no password, so nothing can age out. Without this
  // they would be blocked at 90 days and sent to change a password that does not
  // exist — a dead end with no way back.
  if (user && user.password && isPasswordExpired(user.passwordChangedAt)) {
    res.status(403).json({
      success: false,
      message: 'Your password has expired. Please set a new one to continue.',
      data: { passwordExpired: true },
    });
    return;
  }

  next();
};
