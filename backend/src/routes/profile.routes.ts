import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireFreshPassword } from '../middleware/requireFreshPassword';
import { authLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/password', asyncHandler(profileController.passwordStatus));
router.post('/password', authLimiter, asyncHandler(profileController.changePassword));

router.use(requireFreshPassword);

router.get('/', asyncHandler(profileController.getProfile));
router.patch('/', asyncHandler(profileController.updateProfile));
router.post('/address', asyncHandler(profileController.addAddress));
router.get('/address', asyncHandler(profileController.listAddresses));

export default router;
