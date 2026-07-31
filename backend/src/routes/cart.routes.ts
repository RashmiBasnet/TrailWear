import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireFreshPassword } from '../middleware/requireFreshPassword';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth, requireFreshPassword);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', asyncHandler(cartController.addItem));
router.patch('/items/:id', asyncHandler(cartController.updateItem));
router.delete('/items/:id', asyncHandler(cartController.removeItem));
router.delete('/', asyncHandler(cartController.clearCart));

export default router;
