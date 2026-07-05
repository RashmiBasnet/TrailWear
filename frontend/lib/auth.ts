import axios from "./axios";
import { API } from "./endpoints";
import { setAuthToken, clearAuthToken } from "./cookie";

const extractToken = (setCookieHeader: string[] | undefined) => {
    const tokenCookie = setCookieHeader?.find((c) => c.startsWith("token="));
    if (!tokenCookie) return null;
    return tokenCookie.split(";")[0].slice("token=".length) || null;
}

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
        const token = extractToken(response.headers["set-cookie"]);
        if (token) {
            await setAuthToken(token);
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
        return response.data;
    } catch (err: Error | any) {
        await clearAuthToken();
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Logout Failed"
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
