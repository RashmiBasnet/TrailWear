"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
    const { user, loading, login, verifyMfa, verifyMfaBackupCode } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState("");

    // Second factor step
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState("");
    const [useBackupCode, setUseBackupCode] = useState(false);

    useEffect(() => {
        if (loading || !user || redirecting) return;
        router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }, [user, loading, redirecting, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            toast.error("Missing login details", "Please enter your email and password.");
            return;
        }

        setSubmitting(true);
        const result = await login({ email: email.trim(), password });
        setSubmitting(false);

        if (!result.success) {
            const message = result.message || "Login failed.";
            setError(message);
            toast.error("Login failed", message);
            return;
        }

        // Password accepted but the account has a second factor: no session yet.
        if (result.data?.mfaRequired) {
            setMfaRequired(true);
            setPassword("");
            return;
        }

        finishLogin(result.data?.user?.role);
    };

    const finishLogin = (role?: string) => {
        setRedirecting(true);
        toast.success("Logged in", "Welcome back to TrailWear.");
        router.replace(role === "ADMIN" ? "/admin" : "/");
    };

    const onSubmitMfa = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const code = mfaCode.trim();
        if (!code) {
            setError(useBackupCode ? "Enter a backup code." : "Enter your 6-digit code.");
            return;
        }

        setSubmitting(true);
        const result = useBackupCode
            ? await verifyMfaBackupCode(code)
            : await verifyMfa(code);
        setSubmitting(false);

        if (result.success) {
            if (typeof result.data?.backupCodesLeft === "number") {
                toast.info(
                    "Backup code used",
                    `${result.data.backupCodesLeft} backup code${result.data.backupCodesLeft === 1 ? "" : "s"} remaining.`
                );
            }
            finishLogin(result.data?.user?.role);
        } else {
            const message = result.message || "Verification failed.";
            setError(message);
            toast.error("Verification failed", message);
            setMfaCode("");
        }
    };

    const onBackToPassword = () => {
        setMfaRequired(false);
        setMfaCode("");
        setUseBackupCode(false);
        setError("");
    };

    if (mfaRequired) {
        return (
            <div className="w-full max-w-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
                    <ShieldCheck className="h-6 w-6 text-navy-600" />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                    Two-step verification
                </h1>
                <p className="mt-2 text-sm text-navy-400">
                    {useBackupCode
                        ? "Enter one of the backup codes you saved when you set up two-factor authentication."
                        : "Enter the 6-digit code from your authenticator app to finish signing in."}
                </p>

                <form onSubmit={onSubmitMfa} className="mt-8 space-y-5">
                    {error && (
                        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    )}

                    <div>
                        <label htmlFor="mfaCode" className="mb-1.5 block text-sm font-medium text-navy-800">
                            {useBackupCode ? "Backup code" : "Authentication code"}
                        </label>
                        <input
                            id="mfaCode"
                            type="text"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            placeholder={useBackupCode ? "a1b2-c3d4" : "123456"}
                            inputMode={useBackupCode ? "text" : "numeric"}
                            autoComplete="one-time-code"
                            maxLength={useBackupCode ? 9 : 6}
                            autoFocus
                            className={`w-full rounded-xl border border-border bg-white px-4 py-2.5 text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100 ${
                                useBackupCode
                                    ? "font-mono text-base"
                                    : "text-center font-mono text-2xl tracking-[0.4em]"
                            }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 disabled:opacity-60"
                    >
                        {submitting ? "Verifying…" : "Verify and sign in"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setUseBackupCode((v) => !v);
                            setMfaCode("");
                            setError("");
                        }}
                        className="w-full text-center text-sm font-medium text-navy-500 hover:text-navy-800"
                    >
                        {useBackupCode ? "Use your authenticator app instead" : "Lost your device? Use a backup code"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={onBackToPassword}
                    className="mt-8 flex w-full items-center justify-center gap-1.5 text-sm text-navy-400 hover:text-navy-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-navy-800">Welcome back</h1>
            <p className="mt-2 text-sm text-navy-400">
                Log in to your account to keep exploring.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
                {error && (
                    <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}

                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-800">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-800">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 disabled:opacity-60"
                >
                    {submitting ? "Logging in…" : "Log in"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy-400">
                New to TrailWear?{" "}
                <Link href="/signup" className="font-semibold text-navy-700 hover:text-navy-900 hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}
