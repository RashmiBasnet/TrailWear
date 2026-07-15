import { Router } from 'express';
import * as mfaController from '../controllers/mfa.controller';
import { requireAuth } from '../middleware/requireAuth';
import { mfaLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Login step two. These are intentionally NOT behind requireAuth: the caller has
// proven their password but has no session yet, only the pending cookie.
router.post('/verify', mfaLimiter, asyncHandler(mfaController.verify));
router.post('/backup', mfaLimiter, asyncHandler(mfaController.verifyBackup));

// Enrolment management, which requires a full session.
router.get('/status', requireAuth, asyncHandler(mfaController.status));
router.post('/setup', requireAuth, mfaLimiter, asyncHandler(mfaController.setup));
router.post('/enable', requireAuth, mfaLimiter, asyncHandler(mfaController.enable));
router.post('/disable', requireAuth, mfaLimiter, asyncHandler(mfaController.disable));

export default router;
