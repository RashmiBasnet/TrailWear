"use server";

import { getAllProducts, getProductById } from "../product";

export const handleGetAllProducts = async (params?: any) => {
    try {
        const result = await getAllProducts(params);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Products fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch products"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ALL PRODUCTS ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch products"
        };
    }
}

export const handleGetProductById = async (id: string) => {
    try {
        const result = await getProductById(id);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Product fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch product"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET PRODUCT BY ID ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch product"
        };
    }
}
