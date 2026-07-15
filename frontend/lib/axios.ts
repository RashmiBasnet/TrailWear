import axios from "axios";
import { getAuthToken, getMfaPendingToken } from "./cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create(
    {
        baseURL: BASE_URL,
        headers: {
            "Content-Type": "application/json",
        }
    }
);

axiosInstance.interceptors.request.use(
    async (config) => {
        // Forward whichever cookies we hold. During the MFA step the user has no
        // session token yet, only the short-lived pending one.
        const parts: string[] = [];

        const token = await getAuthToken();
        if (token) parts.push(`token=${token}`);

        const pending = await getMfaPendingToken();
        if (pending) parts.push(`mfa_pending=${pending}`);

        if (parts.length > 0 && config.headers) {
            config.headers["Cookie"] = parts.join("; ");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
