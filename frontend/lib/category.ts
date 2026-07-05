import axios from "./axios";
import { API } from "./endpoints";

export const getAllCategories = async () => {
    try {
        const response = await axios.get(API.CATEGORY.GET_ALL);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch categories"
        );
    }
}

export const getCategoryBySlug = async (slug: string) => {
    try {
        const response = await axios.get(API.CATEGORY.GET_BY_SLUG(slug));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch category"
        );
    }
}
