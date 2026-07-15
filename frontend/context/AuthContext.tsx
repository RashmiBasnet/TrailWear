"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { handleRegister, handleLogin, handleLogout, handleGetMe } from "@/lib/actions/auth-action";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const result = await handleGetMe();
            if (result.success) {
                setUser(result.data.user);
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const register = async (formData: any) => {
        const result = await handleRegister(formData);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const login = async (formData: any) => {
        const result = await handleLogin(formData);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const logout = async () => {
        const result = await handleLogout();
        setUser(null);
        return result;
    };

    const refreshUser = async () => {
        const result = await handleGetMe();
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
