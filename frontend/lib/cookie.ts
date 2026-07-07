"use server";

import { cookies } from "next/headers";

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "token",
        value: token,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
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
