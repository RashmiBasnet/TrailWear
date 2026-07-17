import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import * as categoryService from '../services/category.service';
import * as adminService from '../services/admin.service';
import * as auditService from '../services/audit.service';
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
  const files = req.files as Express.Multer.File[] | undefined;
  const images = files ? files.map((file) => `/uploads/${file.filename}`) : [];
  const product = await productService.createProduct({ ...input, images });
  await auditService.record(req, { action: 'CREATE', entity: 'Product', entityId: product.id });
  res.status(201).json({ success: true, data: { product } });
}

export async function updateProduct(req: Request, res: Response) {
  const input = updateProductSchema.parse(req.body);
  const files = req.files as Express.Multer.File[] | undefined;
  if (files && files.length > 0) {
    input.images = files.map((file) => `/uploads/${file.filename}`);
  }
  const product = await productService.updateProduct(req.params.id, input);
  await auditService.record(req, { action: 'UPDATE', entity: 'Product', entityId: product.id });
  res.json({ success: true, data: { product } });
}

export async function deleteProduct(req: Request, res: Response) {
  await productService.deleteProduct(req.params.id);
  await auditService.record(req, { action: 'DELETE', entity: 'Product', entityId: req.params.id });
  res.json({ success: true, message: 'Product deleted' });
}

export async function createCategory(req: Request, res: Response) {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  await auditService.record(req, { action: 'CREATE', entity: 'Category', entityId: category.id });
  res.status(201).json({ success: true, data: { category } });
}

export async function listUsers(_req: Request, res: Response) {
  const users = await adminService.listUsers();
  res.json({ success: true, data: { users } });
}
