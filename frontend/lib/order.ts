import axios from "./axios";
import { API } from "./endpoints";

export const createOrder = async (orderData: any) => {
    try {
        const response = await axios.post(API.ORDER.CREATE, orderData);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to place order"
        );
    }
}

export const getOrders = async () => {
    try {
        const response = await axios.get(API.ORDER.GET_ALL);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch orders"
        );
    }
}

export const getOrderById = async (id: string) => {
    try {
        const response = await axios.get(API.ORDER.GET_BY_ID(id));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch order"
        );
    }
}

export const initiateEsewa = async (orderData: any) => {
    try {
        const response = await axios.post(API.ORDER.ESEWA_INITIATE, orderData);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to start eSewa payment"
        );
    }
}

export const verifyEsewa = async (data: string) => {
    try {
        const response = await axios.post(API.ORDER.ESEWA_VERIFY, { data });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to verify eSewa payment"
        );
    }
}
