"use client";

import {
    CheckCircle2,
    Info,
    X,
    XCircle,
} from "lucide-react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type ToastInput = {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
};

type Toast = Required<Pick<ToastInput, "title" | "type" | "duration">> &
    Pick<ToastInput, "description"> & {
        id: string;
    };

type ToastContextValue = {
    showToast: (toast: ToastInput) => void;
    toast: {
        success: (title: string, description?: string) => void;
        error: (title: string, description?: string) => void;
        info: (title: string, description?: string) => void;
    };
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: ReactNode; accent: string }> = {
    success: {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
        accent: "border-l-success",
    },
    error: {
        icon: <XCircle className="h-5 w-5 text-danger" />,
        accent: "border-l-danger",
    },
    info: {
        icon: <Info className="h-5 w-5 text-navy-600" />,
        accent: "border-l-gold-400",
    },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        ({ title, description, type = "info", duration = 4000 }: ToastInput) => {
            const id =
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`;

            setToasts((current) => [
                { id, title, description, type, duration },
                ...current.slice(0, 3),
            ]);

            window.setTimeout(() => dismiss(id), duration);
        },
        [dismiss]
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            showToast,
            toast: {
                success: (title, description) => showToast({ title, description, type: "success" }),
                error: (title, description) => showToast({ title, description, type: "error" }),
                info: (title, description) => showToast({ title, description, type: "info" }),
            },
        }),
        [showToast]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full"
            >
                {toasts.map((toast) => {
                    const style = toastStyles[toast.type];

                    return (
                        <div
                            key={toast.id}
                            role="status"
                            className={`flex items-start gap-3 rounded-lg border border-border border-l-4 ${style.accent} bg-white p-4 text-navy-800 shadow-lg shadow-navy-900/10`}
                        >
                            <div className="mt-0.5 shrink-0">{style.icon}</div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-5">{toast.title}</p>
                                {toast.description && (
                                    <p className="mt-1 text-sm leading-5 text-navy-400">
                                        {toast.description}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                aria-label="Dismiss notification"
                                className="rounded-full p-1 text-navy-300 hover:bg-navy-50 hover:text-navy-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context.toast;
}
