import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireFreshPassword } from '../middleware/requireFreshPassword';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth, requireFreshPassword);

router.get('/', asyncHandler(wishlistController.getWishlist));
router.post('/', asyncHandler(wishlistController.add));
router.delete('/:productId', asyncHandler(wishlistController.remove));

export default router;
