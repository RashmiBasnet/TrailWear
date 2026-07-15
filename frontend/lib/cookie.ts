"use server";

import { cookies } from "next/headers";

// Must match the backend's JWT_EXPIRES_IN (30d). If this is shorter, the browser
// drops the cookie early and the user is logged out while their JWT is still valid.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

// Short window to complete the second factor; mirrors the backend's pending token.
const MFA_PENDING_MAX_AGE = 5 * 60;

const baseCookie = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
} as const;

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({ ...baseCookie, name: "token", value: token, maxAge: SESSION_MAX_AGE });
}

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return token || null;
}

export const clearAuthToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("token");
}

export const setMfaPendingToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        ...baseCookie,
        name: "mfa_pending",
        value: token,
        maxAge: MFA_PENDING_MAX_AGE,
    });
}

export const getMfaPendingToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("mfa_pending")?.value;
    return token || null;
}

export const clearMfaPendingToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("mfa_pending");
}
