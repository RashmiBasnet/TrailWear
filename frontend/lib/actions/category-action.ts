"use server";

import { getAllCategories, getCategoryBySlug } from "../category";

export const handleGetAllCategories = async () => {
    try {
        const result = await getAllCategories();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Categories fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch categories"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ALL CATEGORIES ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch categories"
        };
    }
}

export const handleGetCategoryBySlug = async (slug: string) => {
    try {
        const result = await getCategoryBySlug(slug);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Category fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch category"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET CATEGORY BY SLUG ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch category"
        };
    }
}
