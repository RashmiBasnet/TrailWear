import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(categoryController.list));
router.get('/:slug', asyncHandler(categoryController.getBySlug));

export default router;
