import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.getById));

export default router;
