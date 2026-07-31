"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Lock, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { handleResetPassword } from "@/lib/actions/auth-action";
import PasswordStrengthMeter, {
    MINIMUM_SCORE,
    scorePassword,
} from "@/app/_components/PasswordStrengthMeter";
import { useCsrf } from "@/app/_components/CsrfProvider";

const PASSWORD_REQUIREMENTS = [
    { key: "length", label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { key: "case", label: "Upper & lowercase letters", test: (pw: string) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { key: "number", label: "At least one number", test: (pw: string) => /\d/.test(pw) },
];

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="w-full max-w-md" />}>
            <ResetPassword />
        </Suspense>
    );
}

function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const toast = useToast();
    const csrfToken = useCsrf();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const userInputs = useMemo(() => ["trailwear"], []);
    const strengthScore = useMemo(
        () => scorePassword(password, userInputs)?.score ?? 0,
        [password, userInputs]
    );
    const meetsRules = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
    const isStrong = meetsRules && strengthScore >= MINIMUM_SCORE;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("This reset link is missing its token. Request a new one.");
            return;
        }
        if (!password || !confirmPassword) {
            setError("Please enter and confirm your new password.");
            return;
        }
        if (!isStrong) {
            setError("Please choose a stronger password — see the guidance below.");
            toast.error("Password is too weak", "Choose a longer or less predictable password.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.error("Passwords do not match", "Please re-enter the same password.");
            return;
        }

        setSubmitting(true);
        const result = await handleResetPassword(csrfToken, token, password);
        setSubmitting(false);

        if (result.success) {
            setDone(true);
            toast.success("Password reset", "You can now log in with your new password.");
            return;
        }

        setError(result.message);
        toast.error("Couldn't reset password", result.message);
    };

    if (!token) {
        return (
            <div className="w-full max-w-md text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                    <AlertCircle className="h-6 w-6 text-danger" />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                    Link didn&apos;t work
                </h1>
                <p className="mt-2 text-sm text-navy-400">
                    This reset link is missing its token, so we can&apos;t verify it.
                </p>
                <p className="mt-2 text-xs text-navy-300">
                    Reset links expire after 1 hour and can only be used once.
                </p>
                <Link
                    href="/forgot-password"
                    className="mt-8 inline-block w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700"
                >
                    Request a new link
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="w-full max-w-md text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                    Password reset
                </h1>
                <p className="mt-2 text-sm text-navy-400">
                    Your password has been changed and every other device has been signed
                    out. Log in with your new password to continue.
                </p>
                <Link
                    href="/login"
                    className="mt-8 inline-block w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700"
                >
                    Continue to login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-navy-800">Choose a new password</h1>
            <p className="mt-2 text-sm text-navy-400">
                Pick a password you don&apos;t use anywhere else. You can&apos;t reuse a
                recent one.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
                {error && (
                    <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}

                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-800">
                        New password
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            autoFocus
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
                    <PasswordStrengthMeter password={password} userInputs={userInputs} />
                    <ul className="mt-2 space-y-1">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                            const met = req.test(password);
                            return (
                                <li
                                    key={req.key}
                                    className={`flex items-center gap-1.5 text-xs ${
                                        met ? "text-success" : "text-navy-300"
                                    }`}
                                >
                                    {met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                    {req.label}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-navy-800">
                        Confirm new password
                    </label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 disabled:opacity-60"
                >
                    {submitting ? "Resetting…" : "Reset password"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy-400">
                <Link href="/login" className="font-semibold text-navy-700 hover:text-navy-900 hover:underline">
                    Back to login
                </Link>
            </p>
        </div>
    );
}
