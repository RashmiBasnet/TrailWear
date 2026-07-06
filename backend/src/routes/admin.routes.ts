import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { uploads } from '../middleware/upload';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/products', asyncHandler(adminController.listProducts));
router.post('/products', uploads.array('images', 5), asyncHandler(adminController.createProduct));
router.patch('/products/:id', uploads.array('images', 5), asyncHandler(adminController.updateProduct));
router.delete('/products/:id', asyncHandler(adminController.deleteProduct));
router.post('/categories', asyncHandler(adminController.createCategory));
router.get('/users', asyncHandler(adminController.listUsers));

export default router;
