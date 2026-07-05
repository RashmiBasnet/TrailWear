import axios from "./axios";
import { API } from "./endpoints";

export const getProfile = async () => {
    try {
        const response = await axios.get(API.PROFILE.GET);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch profile"
        );
    }
}

export const updateProfile = async (profileData: any) => {
    try {
        const response = await axios.patch(
            API.PROFILE.UPDATE,
            profileData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update profile"
        );
    }
}

export const addAddress = async (addressData: any) => {
    try {
        const response = await axios.post(
            API.PROFILE.ADD_ADDRESS,
            addressData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to add address"
        );
    }
}

export const getAddresses = async () => {
    try {
        const response = await axios.get(API.PROFILE.GET_ADDRESSES);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch addresses"
        );
    }
}
