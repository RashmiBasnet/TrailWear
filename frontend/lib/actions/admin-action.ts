"use server";

import {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    getAllUsers,
} from "../admin";

export const handleGetAdminProducts = async (params?: any) => {
    try {
        const result = await getAdminProducts(params);
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
        console.log("HANDLE GET ADMIN PRODUCTS ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch products"
        };
    }
}

export const handleCreateProduct = async (productData: any) => {
    try {
        const result = await createProduct(productData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Product created"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create product"
        };
    } catch (err: Error | any) {
        console.log("HANDLE CREATE PRODUCT ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to create product"
        };
    }
}

export const handleUpdateProduct = async (id: string, productData: any) => {
    try {
        const result = await updateProduct(id, productData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Product updated"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update product"
        };
    } catch (err: Error | any) {
        console.log("HANDLE UPDATE PRODUCT ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to update product"
        };
    }
}

export const handleDeleteProduct = async (id: string) => {
    try {
        const result = await deleteProduct(id);
        if (result.success) {
            return {
                success: true,
                message: "Product deleted"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete product"
        };
    } catch (err: Error | any) {
        console.log("HANDLE DELETE PRODUCT ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to delete product"
        };
    }
}

export const handleCreateCategory = async (categoryData: any) => {
    try {
        const result = await createCategory(categoryData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Category created"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create category"
        };
    } catch (err: Error | any) {
        console.log("HANDLE CREATE CATEGORY ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to create category"
        };
    }
}

export const handleGetAllUsers = async () => {
    try {
        const result = await getAllUsers();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Users fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch users"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ALL USERS ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch users"
        };
    }
}
