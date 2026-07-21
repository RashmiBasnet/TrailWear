import * as orderRepository from '../repositories/order.repository';
import * as cartRepository from '../repositories/cart.repository';
import * as addressRepository from '../repositories/address.repository';
import { toOrderSummary } from '../models/order.model';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import * as esewa from '../utils/esewa';
import type { EsewaCallbackData, EsewaFormFields } from '../utils/esewa';
import type { CreateOrderDto, VerifyEsewaDto } from '../dtos/order.dto';
import type { OrderSummary } from '../types/order.types';

export async function listOrders(userId: string): Promise<OrderSummary[]> {
  const orders = await orderRepository.findByUser(userId);
  return orders.map(toOrderSummary);
}

export async function getOrder(userId: string, orderId: string): Promise<OrderSummary> {
  const order = await orderRepository.findByIdForUser(orderId, userId);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  return toOrderSummary(order);
}

async function prepareOrder(userId: string, addressId: string) {
  const address = await addressRepository.findByIdForUser(addressId, userId);
  if (!address) {
    throw new AppError(400, 'Delivery address not found');
  }

  const cart = await cartRepository.findByUserWithItems(userId);
  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'Your cart is empty');
  }

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw new AppError(400, `${item.product.name} only has ${item.product.stock} left in stock`);
    }
  }

  const items = cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: Number(item.product.price),
    size: item.size,
  }));
  const total = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

  return { items, total };
}

export async function createOrder(
  userId: string,
  input: CreateOrderDto
): Promise<OrderSummary> {
  const { items, total } = await prepareOrder(userId, input.addressId);

  try {
    const order = await orderRepository.createFromCart(userId, input.addressId, items, total);
    return toOrderSummary(order);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('STOCK:')) {
      throw new AppError(409, err.message.slice('STOCK:'.length));
    }
    throw err;
  }
}

export async function initiateEsewaPayment(
  userId: string,
  input: CreateOrderDto
): Promise<{ orderId: string; formUrl: string; fields: EsewaFormFields }> {
  const { items, total } = await prepareOrder(userId, input.addressId);

  const order = await orderRepository.createPendingEsewaOrder(
    userId,
    input.addressId,
    items,
    total
  );

  const fields = esewa.buildPaymentFields({
    totalAmount: total.toString(),
    transactionUuid: order.id,
    successUrl: `${env.CLIENT_URL}/checkout/callback`,
    failureUrl: `${env.CLIENT_URL}/checkout/callback?status=failure`,
  });

  return { orderId: order.id, formUrl: env.ESEWA_FORM_URL, fields };
}

export async function verifyEsewaPayment(
  userId: string,
  input: VerifyEsewaDto
): Promise<OrderSummary> {
  let data: EsewaCallbackData;
  try {
    data = JSON.parse(Buffer.from(input.data, 'base64').toString('utf-8'));
  } catch {
    throw new AppError(400, 'Invalid payment response');
  }

  if (!esewa.verifyCallbackSignature(data)) {
    throw new AppError(400, 'Payment response failed verification');
  }

  const order = await orderRepository.findByIdForUser(data.transaction_uuid, userId);
  if (!order) {
    throw new AppError(404, 'Order not found for this payment');
  }

  const lookup = await esewa.checkTransactionStatus(data.total_amount, data.transaction_uuid);

  if (lookup.status !== 'COMPLETE') {
    await orderRepository.markPaymentFailed(order.id);
    throw new AppError(402, `Payment ${lookup.status.toLowerCase()}. Order was not placed.`);
  }

  try {
    const finalized = await orderRepository.finalizePaidEsewaOrder(order.id, userId, lookup.refId);
    if (!finalized) {
      throw new AppError(404, 'Order not found');
    }
    return toOrderSummary(finalized);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('STOCK:')) {
      throw new AppError(409, err.message.slice('STOCK:'.length));
    }
    throw err;
  }
}
