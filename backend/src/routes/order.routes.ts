import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(orderController.listOrders));
router.get('/:id', asyncHandler(orderController.getOrder));
router.post('/', asyncHandler(orderController.createOrder));

export default router;
