import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { createOrderSchema } from '../dtos/order.dto';

export async function listOrders(req: Request, res: Response) {
  const orders = await orderService.listOrders(req.user!.id);
  res.json({ success: true, data: { orders } });
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrder(req.user!.id, req.params.id);
  res.json({ success: true, data: { order } });
}

export async function createOrder(req: Request, res: Response) {
  const input = createOrderSchema.parse(req.body);
  const order = await orderService.createOrder(req.user!.id, input);
  res.status(201).json({ success: true, data: { order } });
}
