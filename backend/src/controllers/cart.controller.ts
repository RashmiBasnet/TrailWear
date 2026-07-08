import type { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { addCartItemSchema, updateCartItemSchema } from '../dtos/cart.dto';

export async function getCart(req: Request, res: Response) {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: { cart } });
}

export async function addItem(req: Request, res: Response) {
  const { productId, quantity, size } = addCartItemSchema.parse(req.body);
  const cart = await cartService.addItem(req.user!.id, productId, quantity, size);
  res.status(201).json({ success: true, data: { cart } });
}

export async function updateItem(req: Request, res: Response) {
  const { quantity } = updateCartItemSchema.parse(req.body);
  const cart = await cartService.updateItem(req.user!.id, req.params.id, quantity);
  res.json({ success: true, data: { cart } });
}

export async function removeItem(req: Request, res: Response) {
  const cart = await cartService.removeItem(req.user!.id, req.params.id);
  res.json({ success: true, data: { cart } });
}

export async function clearCart(req: Request, res: Response) {
  const cart = await cartService.clearCart(req.user!.id);
  res.json({ success: true, data: { cart } });
}
