import axios from "./axios";
import { API } from "./endpoints";

export const getCart = async () => {
    try {
        const response = await axios.get(API.CART.GET);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch cart"
        );
    }
}

export const addCartItem = async (cartData: any) => {
    try {
        const response = await axios.post(
            API.CART.ADD_ITEM,
            cartData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to add item to cart"
        );
    }
}

export const updateCartItem = async (itemId: string, updateData: any) => {
    try {
        const response = await axios.patch(
            API.CART.UPDATE_ITEM(itemId),
            updateData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update cart item"
        );
    }
}

export const removeCartItem = async (itemId: string) => {
    try {
        const response = await axios.delete(API.CART.REMOVE_ITEM(itemId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to remove cart item"
        );
    }
}

export const clearCart = async () => {
    try {
        const response = await axios.delete(API.CART.CLEAR);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to clear cart"
        );
    }
}
