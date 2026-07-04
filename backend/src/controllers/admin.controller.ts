import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import * as categoryService from '../services/category.service';
import * as adminService from '../services/admin.service';
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from '../dtos/product.dto';
import { createCategorySchema } from '../dtos/category.dto';

export async function listProducts(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const result = await productService.listProducts(query);
  res.json({ success: true, data: result });
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(input);
  res.status(201).json({ success: true, data: { product } });
}

export async function updateProduct(req: Request, res: Response) {
  const input = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(req.params.id, input);
  res.json({ success: true, data: { product } });
}

export async function deleteProduct(req: Request, res: Response) {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
}

export async function createCategory(req: Request, res: Response) {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  res.status(201).json({ success: true, data: { category } });
}

export async function listUsers(_req: Request, res: Response) {
  const users = await adminService.listUsers();
  res.json({ success: true, data: { users } });
}
