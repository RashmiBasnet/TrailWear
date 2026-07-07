import * as wishlistRepository from '../repositories/wishlist.repository';
import * as productRepository from '../repositories/product.repository';
import { toWishlistEntry } from '../models/wishlist.model';
import { AppError } from '../utils/AppError';
import type { WishlistEntry } from '../types/wishlist.types';

export async function getWishlist(userId: string): Promise<WishlistEntry[]> {
  const items = await wishlistRepository.findByUser(userId);
  return items.map(toWishlistEntry);
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistEntry[]> {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  await wishlistRepository.upsert(userId, productId);
  return getWishlist(userId);
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<WishlistEntry[]> {
  await wishlistRepository.deleteByUserAndProduct(userId, productId);
  return getWishlist(userId);
}
