"use server";

import { createOrder, getOrders, getOrderById } from "../order";

export const handleCreateOrder = async (orderData: any) => {
    try {
        const result = await createOrder(orderData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Order placed"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to place order"
        };
    } catch (err: Error | any) {
        console.log("HANDLE CREATE ORDER ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to place order"
        };
    }
}

export const handleGetOrders = async () => {
    try {
        const result = await getOrders();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Orders fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch orders"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ORDERS ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch orders"
        };
    }
}

export const handleGetOrderById = async (id: string) => {
    try {
        const result = await getOrderById(id);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Order fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch order"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ORDER ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch order"
        };
    }
}
