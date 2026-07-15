import axios from "./axios";
import { API } from "./endpoints";
import {
    setAuthToken,
    clearAuthToken,
    setMfaPendingToken,
    clearMfaPendingToken,
} from "./cookie";

const extractCookie = (setCookieHeader: string[] | undefined, name: string) => {
    const cookie = setCookieHeader?.find((c) => c.startsWith(`${name}=`));
    if (!cookie) return null;
    return cookie.split(";")[0].slice(name.length + 1) || null;
}

const extractToken = (setCookieHeader: string[] | undefined) =>
    extractCookie(setCookieHeader, "token");

export const registerUser = async (registerData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.REGISTER,
            registerData
        );
        const token = extractToken(response.headers["set-cookie"]);
        if (token) {
            await setAuthToken(token);
        }
        return response.data;
    } catch (err: Error | any) {
        console.log("REGISTER ERROR:", err.response?.data);
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Registration Failed"
        );
    }
}

export const loginUser = async (loginData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.LOGIN,
            loginData
        );
        const setCookie = response.headers["set-cookie"];

        // With MFA enabled the backend withholds the session and returns a
        // short-lived pending cookie instead, which only /mfa/verify can redeem.
        const token = extractToken(setCookie);
        if (token) {
            await setAuthToken(token);
        }

        const pending = extractCookie(setCookie, "mfa_pending");
        if (pending) {
            await setMfaPendingToken(pending);
        }

        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Login Failed"
        );
    }
}

export const logoutUser = async () => {
    try {
        const response = await axios.post(API.AUTH.LOGOUT);
        await clearAuthToken();
        await clearMfaPendingToken();
        return response.data;
    } catch (err: Error | any) {
        await clearAuthToken();
        await clearMfaPendingToken();
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Logout Failed"
        );
    }
}

/** Redeems the pending token + a TOTP (or backup) code for a real session. */
const completeMfa = async (endpoint: string, code: string, fallbackMessage: string) => {
    try {
        const response = await axios.post(endpoint, { code });
        const token = extractToken(response.headers["set-cookie"]);
        if (token) {
            await setAuthToken(token);
        }
        await clearMfaPendingToken();
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || fallbackMessage
        );
    }
}

export const verifyMfa = async (code: string) =>
    completeMfa(API.AUTH.MFA.VERIFY, code, "Verification failed");

export const verifyMfaBackupCode = async (code: string) =>
    completeMfa(API.AUTH.MFA.BACKUP, code, "Verification failed");

export const getMfaStatus = async () => {
    try {
        const response = await axios.get(API.AUTH.MFA.STATUS);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch two-factor status"
        );
    }
}

export const setupMfa = async () => {
    try {
        const response = await axios.post(API.AUTH.MFA.SETUP);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to start two-factor setup"
        );
    }
}

export const enableMfa = async (code: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA.ENABLE, { code });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to enable two-factor authentication"
        );
    }
}

export const disableMfa = async (password: string, code: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA.DISABLE, { password, code });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to disable two-factor authentication"
        );
    }
}

export const getMe = async () => {
    try {
        const response = await axios.get(API.AUTH.ME);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch user"
        );
    }
}
