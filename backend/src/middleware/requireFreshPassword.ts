import type { RequestHandler } from 'express';
import * as userRepository from '../repositories/user.repository';
import { isPasswordExpired } from '../services/password.service';

export const requireFreshPassword: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    next();
    return;
  }

  const user = await userRepository.findById(req.user.id);

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
