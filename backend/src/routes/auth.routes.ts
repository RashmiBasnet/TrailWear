import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/verify-email', authLimiter, asyncHandler(authController.verifyEmail));
// Rate limited like the rest of auth: it sends mail to an address the caller
// supplies, so without a cap it is an open relay pointed at someone's inbox.
router.post('/resend-verification', authLimiter, asyncHandler(authController.resendVerification));
router.post('/login', authLimiter, asyncHandler(authController.login));
// No captcha on these two: the browser is handed straight to Google, which runs
// its own bot defences, and a challenge cannot be solved mid-redirect anyway.
// The rate limiter still applies.
router.get('/google/start', authLimiter, asyncHandler(authController.googleStart));
router.post('/google/callback', authLimiter, asyncHandler(authController.googleCallback));

router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

export default router;
