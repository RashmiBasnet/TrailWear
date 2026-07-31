import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import * as auditService from '../services/audit.service';
import { createOrderSchema, verifyEsewaSchema } from '../dtos/order.dto';

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
  await auditService.record(req, {
    action: 'ORDER_PLACED',
    entity: 'Order',
    entityId: order.id,
    metadata: { total: order.total, paymentMethod: order.paymentMethod },
  });
  res.status(201).json({ success: true, data: { order } });
}

export async function initiateEsewa(req: Request, res: Response) {
  const input = createOrderSchema.parse(req.body);
  const payment = await orderService.initiateEsewaPayment(req.user!.id, input);
  res.status(201).json({ success: true, data: payment });
}

export async function resumeEsewa(req: Request, res: Response) {
  const payment = await orderService.resumeEsewaPayment(req.user!.id, req.params.id);
  res.json({ success: true, data: payment });
}

export async function cancelOrder(req: Request, res: Response) {
  const order = await orderService.cancelPendingOrder(req.user!.id, req.params.id);
  await auditService.record(req, {
    action: 'ORDER_CANCELLED',
    entity: 'Order',
    entityId: order.id,
    metadata: { total: order.total, paymentMethod: order.paymentMethod },
  });
  res.json({ success: true, data: { order } });
}

export async function verifyEsewa(req: Request, res: Response) {
  const input = verifyEsewaSchema.parse(req.body);
  const order = await orderService.verifyEsewaPayment(req.user!.id, input);
  await auditService.record(req, {
    action: 'ORDER_PLACED',
    entity: 'Order',
    entityId: order.id,
    metadata: { total: order.total, paymentMethod: order.paymentMethod },
  });
  res.json({ success: true, data: { order } });
}
