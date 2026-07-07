import axios from "./axios";
import { API } from "./endpoints";

export const getAllProducts = async (params?: any) => {
    try {
        const response = await axios.get(API.PRODUCT.GET_ALL(params));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch products"
        );
    }
}

export const getProductById = async (id: string) => {
    try {
        const response = await axios.get(API.PRODUCT.GET_BY_ID(id));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch product"
        );
    }
}
