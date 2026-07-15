"use server";

import {
    getMfaStatus,
    setupMfa,
    enableMfa,
    disableMfa,
    verifyMfa,
    verifyMfaBackupCode,
} from "../auth";

export const handleGetMfaStatus = async () => {
    try {
        const result = await getMfaStatus();
        if (result.success) {
            return { success: true, data: result.data, message: "Status fetched" };
        }
        return { success: false, message: result.message || "Failed to fetch two-factor status" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA STATUS ERROR:", err.message);
        return { success: false, message: err.message || "Failed to fetch two-factor status" };
    }
}

export const handleSetupMfa = async () => {
    try {
        const result = await setupMfa();
        if (result.success) {
            return { success: true, data: result.data, message: "Setup started" };
        }
        return { success: false, message: result.message || "Failed to start two-factor setup" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA SETUP ERROR:", err.message);
        return { success: false, message: err.message || "Failed to start two-factor setup" };
    }
}

export const handleEnableMfa = async (code: string) => {
    try {
        const result = await enableMfa(code);
        if (result.success) {
            return { success: true, data: result.data, message: "Two-factor enabled" };
        }
        return { success: false, message: result.message || "Failed to enable two-factor" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA ENABLE ERROR:", err.message);
        return { success: false, message: err.message || "Failed to enable two-factor" };
    }
}

export const handleDisableMfa = async (password: string, code: string) => {
    try {
        const result = await disableMfa(password, code);
        if (result.success) {
            return { success: true, message: "Two-factor disabled" };
        }
        return { success: false, message: result.message || "Failed to disable two-factor" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA DISABLE ERROR:", err.message);
        return { success: false, message: err.message || "Failed to disable two-factor" };
    }
}

export const handleVerifyMfa = async (code: string) => {
    try {
        const result = await verifyMfa(code);
        if (result.success) {
            return { success: true, data: result.data, message: "Verified" };
        }
        return { success: false, message: result.message || "Verification failed" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA VERIFY ERROR:", err.message);
        return { success: false, message: err.message || "Verification failed" };
    }
}

export const handleVerifyMfaBackupCode = async (code: string) => {
    try {
        const result = await verifyMfaBackupCode(code);
        if (result.success) {
            return { success: true, data: result.data, message: "Verified" };
        }
        return { success: false, message: result.message || "Verification failed" };
    } catch (err: Error | any) {
        console.log("HANDLE MFA BACKUP ERROR:", err.message);
        return { success: false, message: err.message || "Verification failed" };
    }
}
