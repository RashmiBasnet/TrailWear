import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(profileController.getProfile));
router.patch('/', asyncHandler(profileController.updateProfile));
router.post('/address', asyncHandler(profileController.addAddress));
router.get('/address', asyncHandler(profileController.listAddresses));

export default router;
