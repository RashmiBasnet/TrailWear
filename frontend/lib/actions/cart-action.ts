"use server";
import { assertCsrf } from "../csrf";

import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from "../cart";

export const handleGetCart = async () => {
    try {
        const result = await getCart();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Cart fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch cart"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET CART ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch cart"
        };
    }
}

export const handleAddCartItem = async (csrfToken: string, cartData: any) => {
    try {
        await assertCsrf(csrfToken);
        const result = await addCartItem(cartData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Item added to cart"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add item to cart"
        };
    } catch (err: Error | any) {
        console.log("HANDLE ADD CART ITEM ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to add item to cart"
        };
    }
}

export const handleUpdateCartItem = async (csrfToken: string, itemId: string, updateData: any) => {
    try {
        await assertCsrf(csrfToken);
        const result = await updateCartItem(itemId, updateData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Cart item updated"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update cart item"
        };
    } catch (err: Error | any) {
        console.log("HANDLE UPDATE CART ITEM ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to update cart item"
        };
    }
}

export const handleRemoveCartItem = async (csrfToken: string, itemId: string) => {
    try {
        await assertCsrf(csrfToken);
        const result = await removeCartItem(itemId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Item removed from cart"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to remove cart item"
        };
    } catch (err: Error | any) {
        console.log("HANDLE REMOVE CART ITEM ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to remove cart item"
        };
    }
}

export const handleClearCart = async (csrfToken: string) => {
    try {
        await assertCsrf(csrfToken);
        const result = await clearCart();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Cart cleared"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to clear cart"
        };
    } catch (err: Error | any) {
        console.log("HANDLE CLEAR CART ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to clear cart"
        };
    }
}
