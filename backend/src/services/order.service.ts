import * as orderRepository from '../repositories/order.repository';
import * as cartRepository from '../repositories/cart.repository';
import * as addressRepository from '../repositories/address.repository';
import { toOrderSummary } from '../models/order.model';
import { AppError } from '../utils/AppError';
import type { CreateOrderDto } from '../dtos/order.dto';
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

export async function createOrder(
  userId: string,
  input: CreateOrderDto
): Promise<OrderSummary> {
  const address = await addressRepository.findByIdForUser(input.addressId, userId);
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
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const order = await orderRepository.createFromCart(
      userId,
      input.addressId,
      items,
      Number(total.toFixed(2))
    );
    return toOrderSummary(order);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('STOCK:')) {
      throw new AppError(409, err.message.slice('STOCK:'.length));
    }
    throw err;
  }
}
