"use server";

import { getProfile, updateProfile, addAddress, getAddresses } from "../profile";

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
