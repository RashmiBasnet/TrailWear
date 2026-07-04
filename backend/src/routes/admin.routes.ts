import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/products', asyncHandler(adminController.listProducts));
router.post('/products', asyncHandler(adminController.createProduct));
router.patch('/products/:id', asyncHandler(adminController.updateProduct));
router.delete('/products/:id', asyncHandler(adminController.deleteProduct));
router.post('/categories', asyncHandler(adminController.createCategory));
router.get('/users', asyncHandler(adminController.listUsers));

export default router;
