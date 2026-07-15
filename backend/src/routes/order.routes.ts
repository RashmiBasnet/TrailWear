import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(orderController.listOrders));
router.post('/', asyncHandler(orderController.createOrder));
router.post('/esewa/initiate', asyncHandler(orderController.initiateEsewa));
router.post('/esewa/verify', asyncHandler(orderController.verifyEsewa));
router.get('/:id', asyncHandler(orderController.getOrder));

export default router;
