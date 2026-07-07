"use server";

import { getWishlist, addToWishlist, removeFromWishlist } from "../wishlist";

export const handleGetWishlist = async () => {
    try {
        const result = await getWishlist();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Wishlist fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch wishlist"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET WISHLIST ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch wishlist"
        };
    }
}

export const handleAddToWishlist = async (productId: string) => {
    try {
        const result = await addToWishlist(productId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Item added to wishlist"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add item to wishlist"
        };
    } catch (err: Error | any) {
        console.log("HANDLE ADD TO WISHLIST ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to add item to wishlist"
        };
    }
}

export const handleRemoveFromWishlist = async (productId: string) => {
    try {
        const result = await removeFromWishlist(productId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Item removed from wishlist"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to remove item from wishlist"
        };
    } catch (err: Error | any) {
        console.log("HANDLE REMOVE FROM WISHLIST ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to remove item from wishlist"
        };
    }
}
