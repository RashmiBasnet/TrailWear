"use server";

import { registerUser, loginUser, logoutUser, getMe } from "../auth";

export const handleRegister = async (formData: any) => {
    try {
        const result = await registerUser(formData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Registration Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Registration Failed"
        };
    } catch (err: Error | any) {
        console.log("HANDLE REGISTER ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Registration Failed"
        };
    }
}

export const handleLogin = async (formData: any) => {
    try {
        const result = await loginUser(formData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Login Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Login Failed"
        };
    } catch (err: Error | any) {
        console.log("HANDLE LOGIN ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Login Failed"
        };
    }
}

export const handleLogout = async () => {
    try {
        const result = await logoutUser();
        if (result.success) {
            return {
                success: true,
                message: "Logout Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Logout Failed"
        };
    } catch (err: Error | any) {
        console.log("HANDLE LOGOUT ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Logout Failed"
        };
    }
}

export const handleGetMe = async () => {
    try {
        const result = await getMe();
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "User fetched"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch user"
        };
    } catch (err: Error | any) {
        console.log("HANDLE GET ME ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Failed to fetch user"
        };
    }
}
