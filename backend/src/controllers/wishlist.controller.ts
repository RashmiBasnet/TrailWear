import type { Request, Response } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { addWishlistItemSchema } from '../dtos/wishlist.dto';

export async function getWishlist(req: Request, res: Response) {
  const wishlist = await wishlistService.getWishlist(req.user!.id);
  res.json({ success: true, data: { wishlist } });
}

export async function add(req: Request, res: Response) {
  const { productId } = addWishlistItemSchema.parse(req.body);
  const wishlist = await wishlistService.addToWishlist(req.user!.id, productId);
  res.json({ success: true, data: { wishlist } });
}

export async function remove(req: Request, res: Response) {
  const wishlist = await wishlistService.removeFromWishlist(
    req.user!.id,
    req.params.productId
  );
  res.json({ success: true, data: { wishlist } });
}
