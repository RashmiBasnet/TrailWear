"use server";

import {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    verifyEmail,
    resendVerification,
} from "../auth";

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
            message: err.message || "Login Failed",
            emailVerificationRequired: err.emailVerificationRequired === true
        };
    }
}

export const handleVerifyEmail = async (token: string) => {
    try {
        const result = await verifyEmail(token);
        return {
            success: true,
            message: result.message || "Email verified"
        };
    } catch (err: Error | any) {
        console.log("HANDLE VERIFY EMAIL ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Verification failed"
        };
    }
}

export const handleResendVerification = async (email: string) => {
    try {
        const result = await resendVerification(email);
        return {
            success: true,
            message: result.message || "Verification email sent"
        };
    } catch (err: Error | any) {
        console.log("HANDLE RESEND VERIFICATION ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Could not resend the verification email"
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
