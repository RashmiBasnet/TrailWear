import axios from "./axios";
import { API } from "./endpoints";
import { setAuthToken } from "./cookie";

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

export const getPasswordStatus = async () => {
    try {
        const response = await axios.get(API.PROFILE.PASSWORD_STATUS);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch password status"
        );
    }
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
        const response = await axios.post(API.PROFILE.CHANGE_PASSWORD, { currentPassword, newPassword });

        const cookie = (response.headers["set-cookie"] as string[] | undefined)
            ?.find((c) => c.startsWith("token="));
        const token = cookie?.split(";")[0].slice("token=".length);
        if (token) {
            await setAuthToken(token);
        }

        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to change password"
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
