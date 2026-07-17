"use server";

import {
    getProfile,
    updateProfile,
    addAddress,
    getAddresses,
    getPasswordStatus,
    changePassword,
} from "../profile";

export const handleGetPasswordStatus = async () => {
    try {
        const result = await getPasswordStatus();
        if (result.success) {
            return { success: true, data: result.data, message: "Status fetched" };
        }
        return { success: false, message: result.message || "Failed to fetch password status" };
    } catch (err: Error | any) {
        console.log("HANDLE PASSWORD STATUS ERROR:", err.message);
        return { success: false, message: err.message || "Failed to fetch password status" };
    }
}

export const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
        const result = await changePassword(currentPassword, newPassword);
        if (result.success) {
            return { success: true, message: result.message || "Password updated" };
        }
        return { success: false, message: result.message || "Failed to change password" };
    } catch (err: Error | any) {
        console.log("HANDLE CHANGE PASSWORD ERROR:", err.message);
        return { success: false, message: err.message || "Failed to change password" };
    }
}

export const handleGetProfile = async () => {
    try {
        const result = await getProfile();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Profile fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch profile"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET PROFILE ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch profile"
        };
    }
}

export const handleUpdateProfile = async (profileData: any) => {
    try {
        const result = await updateProfile(profileData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Profile updated"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update profile"
        };
    } catch (err: Error | any) {
        console.log("HANDLE UPDATE PROFILE ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to update profile"
        };
    }
}

export const handleAddAddress = async (addressData: any) => {
    try {
        const result = await addAddress(addressData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Address added"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add address"
        };
    } catch (err: Error | any) {
        console.log("HANDLE ADD ADDRESS ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to add address"
        };
    }
}

export const handleGetAddresses = async () => {
    try {
        const result = await getAddresses();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Addresses fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch addresses"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ADDRESSES ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch addresses"
        };
    }
}
