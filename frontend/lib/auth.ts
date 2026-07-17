import axios from "./axios";
import { API } from "./endpoints";
import {
    setAuthToken,
    clearAuthToken,
    setMfaPendingToken,
    clearMfaPendingToken,
    setOAuthStateToken,
    clearOAuthStateToken,
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
        const error: any = new Error(
            err.response?.data?.message
            || err.message
            || "Login Failed"
        );
        // Carried through so the login page can offer a re-send rather than a
        // dead end. The backend only sends this once the password is accepted.
        error.emailVerificationRequired =
            err.response?.data?.data?.emailVerificationRequired === true;
        throw error;
    }
}

export const verifyEmail = async (token: string) => {
    try {
        const response = await axios.post(API.AUTH.VERIFY_EMAIL, { token });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Verification failed"
        );
    }
}

export const resendVerification = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.RESEND_VERIFICATION, { email });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Could not resend the verification email"
        );
    }
}

/**
 * Starts Google sign-in: returns the consent screen URL to send the browser to,
 * and stores the state the callback will be checked against.
 */
export const startGoogleLogin = async () => {
    try {
        const response = await axios.get(API.AUTH.GOOGLE.START);

        const state = extractCookie(response.headers["set-cookie"], "oauth_state");
        if (state) {
            await setOAuthStateToken(state);
        }

        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Could not start Google sign-in"
        );
    }
}

/**
 * Finishes Google sign-in by handing the authorization code to the backend,
 * which exchanges it and replies with the same cookies password login does.
 */
export const completeGoogleLogin = async (code: string, state: string) => {
    try {
        const response = await axios.post(API.AUTH.GOOGLE.CALLBACK, { code, state });
        const setCookie = response.headers["set-cookie"];

        // As with password login, an account with MFA gets a pending token here
        // rather than a session; only /mfa/verify can redeem it.
        const token = extractToken(setCookie);
        if (token) {
            await setAuthToken(token);
        }

        const pending = extractCookie(setCookie, "mfa_pending");
        if (pending) {
            await setMfaPendingToken(pending);
        }

        await clearOAuthStateToken();
        return response.data;
    } catch (err: Error | any) {
        // The state is single use on the backend, so it must not linger here
        // either — a stale one would only fail the next attempt.
        await clearOAuthStateToken();
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Google sign-in failed"
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
