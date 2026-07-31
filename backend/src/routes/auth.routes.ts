import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/verify-email', authLimiter, asyncHandler(authController.verifyEmail));
router.post('/resend-verification', authLimiter, asyncHandler(authController.resendVerification));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword));
router.get('/google/start', authLimiter, asyncHandler(authController.googleStart));
router.post('/google/callback', authLimiter, asyncHandler(authController.googleCallback));

router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

export default router;
