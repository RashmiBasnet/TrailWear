import * as cartRepository from '../repositories/cart.repository';
import * as productRepository from '../repositories/product.repository';
import { toCartSummary } from '../models/cart.model';
import { AppError } from '../utils/AppError';
import type { CartSummary } from '../types/cart.types';

export async function getCart(userId: string): Promise<CartSummary> {
  const cart = await cartRepository.findByUserWithItems(userId);
  return toCartSummary(cart);
}

export async function addItem(
  userId: string,
  productId: string,
  quantity: number,
  size: string
): Promise<CartSummary> {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (product.sizes.length > 0) {
    if (!size) {
      throw new AppError(400, 'Please select a size');
    }
    if (!product.sizes.includes(size)) {
      throw new AppError(400, 'Invalid size selected');
    }
  }

  const cart = await cartRepository.upsertForUser(userId);
  await cartRepository.upsertItem(cart.id, productId, quantity, size);

  return getCart(userId);
}

export async function updateItem(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartSummary> {
  const item = await cartRepository.findItemForUser(itemId, userId);
  if (!item) {
    throw new AppError(404, 'Cart item not found');
  }

  if (quantity === 0) {
    await cartRepository.deleteItem(item.id);
  } else {
    await cartRepository.updateItemQuantity(item.id, quantity);
  }

  return getCart(userId);
}

export async function removeItem(userId: string, itemId: string): Promise<CartSummary> {
  const count = await cartRepository.deleteItemForUser(itemId, userId);
  if (count === 0) {
    throw new AppError(404, 'Cart item not found');
  }
  return getCart(userId);
}

export async function clearCart(userId: string): Promise<CartSummary> {
  await cartRepository.clearByUser(userId);
  return getCart(userId);
}
