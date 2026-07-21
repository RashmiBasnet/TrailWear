"use server";
import { assertCsrf } from "../csrf";

import { createOrder, getOrders, getOrderById, initiateEsewa, verifyEsewa } from "../order";

export const handleCreateOrder = async (csrfToken: string, orderData: any) => {
    try {
        await assertCsrf(csrfToken);
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

export const handleInitiateEsewa = async (csrfToken: string, orderData: any) => {
    try {
        await assertCsrf(csrfToken);
        const result = await initiateEsewa(orderData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "eSewa payment started"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to start eSewa payment"
        };
    } catch (err: Error | any) {
        console.log("HANDLE INITIATE ESEWA ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to start eSewa payment"
        };
    }
}

export const handleVerifyEsewa = async (csrfToken: string, data: string) => {
    try {
        await assertCsrf(csrfToken);
        const result = await verifyEsewa(data);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Payment verified"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to verify eSewa payment"
        };
    } catch (err: Error | any) {
        console.log("HANDLE VERIFY ESEWA ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to verify eSewa payment"
        };
    }
}
