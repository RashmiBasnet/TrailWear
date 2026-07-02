import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export async function list(_req: Request, res: Response) {
  const categories = await categoryService.listCategories();
  res.json({ success: true, data: { categories } });
}

export async function getBySlug(req: Request, res: Response) {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.json({ success: true, data: { category } });
}
