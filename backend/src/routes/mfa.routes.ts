import { Router } from 'express';
import * as mfaController from '../controllers/mfa.controller';
import { requireAuth } from '../middleware/requireAuth';
import { mfaLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/verify', mfaLimiter, asyncHandler(mfaController.verify));
router.post('/backup', mfaLimiter, asyncHandler(mfaController.verifyBackup));

router.get('/status', requireAuth, asyncHandler(mfaController.status));
router.post('/setup', requireAuth, mfaLimiter, asyncHandler(mfaController.setup));
router.post('/enable', requireAuth, mfaLimiter, asyncHandler(mfaController.enable));
router.post('/disable', requireAuth, mfaLimiter, asyncHandler(mfaController.disable));

export default router;
