"use server";

import { cookies } from "next/headers";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

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

const OAUTH_STATE_MAX_AGE = 10 * 60;

export const setOAuthStateToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        ...baseCookie,
        sameSite: "lax",
        name: "oauth_state",
        value: token,
        maxAge: OAUTH_STATE_MAX_AGE,
    });
}

export const getOAuthStateToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("oauth_state")?.value;
    return token || null;
}

export const clearOAuthStateToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("oauth_state");
}
