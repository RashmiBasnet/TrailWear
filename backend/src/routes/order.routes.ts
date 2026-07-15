import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth } from '../middleware/requireAuth';
import { orderLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(orderController.listOrders));
router.post('/', orderLimiter, asyncHandler(orderController.createOrder));
router.post('/esewa/initiate', orderLimiter, asyncHandler(orderController.initiateEsewa));
router.post('/esewa/verify', orderLimiter, asyncHandler(orderController.verifyEsewa));
router.get('/:id', asyncHandler(orderController.getOrder));

export default router;
