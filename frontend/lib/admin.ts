import axios from "./axios";
import { API } from "./endpoints";

export const getAdminProducts = async (params?: any) => {
    try {
        const response = await axios.get(API.ADMIN.PRODUCT.GET_ALL(params));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch products"
        );
    }
}

export const createProduct = async (productData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.PRODUCT.CREATE,
            productData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to create product"
        );
    }
}

export const updateProduct = async (id: string, productData: any) => {
    try {
        const response = await axios.patch(
            API.ADMIN.PRODUCT.UPDATE(id),
            productData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update product"
        );
    }
}

export const deleteProduct = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN.PRODUCT.DELETE(id));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to delete product"
        );
    }
}

export const createCategory = async (categoryData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.CATEGORY.CREATE,
            categoryData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to create category"
        );
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axios.get(API.ADMIN.USER.GET_ALL);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch users"
        );
    }
}
