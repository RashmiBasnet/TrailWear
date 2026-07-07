import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { listProductsQuerySchema } from '../dtos/product.dto';

export async function list(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const result = await productService.listProducts(query);
  res.json({ success: true, data: result });
}

export async function getById(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: { product } });
}
