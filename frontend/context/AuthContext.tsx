"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { handleRegister, handleLogin, handleLogout, handleGetMe } from "@/lib/actions/auth-action";
import { handleVerifyMfa, handleVerifyMfaBackupCode } from "@/lib/actions/mfa-action";
import { useCsrf } from "@/app/_components/CsrfProvider";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const csrfToken = useCsrf();

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
        const result = await handleRegister(csrfToken, formData);
        if (result.success && !result.data?.emailVerificationRequired) {
            setUser(result.data.user);
        }
        return result;
    };

    const login = async (formData: any) => {
        const result = await handleLogin(csrfToken, formData);
        if (result.success && result.data?.user) {
            setUser(result.data.user);
        }
        return result;
    };

    const verifyMfa = async (code: string) => {
        const result = await handleVerifyMfa(csrfToken, code);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const verifyMfaBackupCode = async (code: string) => {
        const result = await handleVerifyMfaBackupCode(csrfToken, code);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const logout = async () => {
        const result = await handleLogout(csrfToken);
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
        <AuthContext.Provider
            value={{ user, loading, register, login, logout, refreshUser, verifyMfa, verifyMfaBackupCode }}
        >
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
