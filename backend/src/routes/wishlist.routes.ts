import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(wishlistController.getWishlist));
router.post('/', asyncHandler(wishlistController.add));
router.delete('/:productId', asyncHandler(wishlistController.remove));

export default router;
