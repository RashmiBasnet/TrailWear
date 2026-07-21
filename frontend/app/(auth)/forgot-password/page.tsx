"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { handleForgotPassword } from "@/lib/actions/auth-action";

export default function ForgotPasswordPage() {
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [sent, setSent] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setSubmitting(true);
        const result = await handleForgotPassword(email.trim());
        setSubmitting(false);

        if (result.success) {
            setSent(true);
            return;
        }

        setError(result.message);
        toast.error("Something went wrong", result.message);
    };

    if (sent) {
        return (
            <div className="w-full max-w-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
                    <MailCheck className="h-6 w-6 text-navy-600" />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                    Check your email
                </h1>
                <p className="mt-2 text-sm text-navy-400">
                    If{" "}
                    <span className="font-medium text-navy-700">{email.trim()}</span>{" "}
                    has a TrailWear account, we&apos;ve sent it a link to reset the password.
                    Open it to choose a new one.
                </p>
                <p className="mt-4 text-xs text-navy-300">
                    The link expires in 1 hour and can only be used once. If it hasn&apos;t
                    arrived in a minute or two, check your spam folder. Accounts that sign
                    in with Google don&apos;t have a password to reset.
                </p>

                <Link
                    href="/login"
                    className="mt-8 flex w-full items-center justify-center gap-1.5 text-sm text-navy-400 hover:text-navy-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-navy-800">Forgot your password?</h1>
            <p className="mt-2 text-sm text-navy-400">
                Enter the email address on your account and we&apos;ll send you a link to
                reset your password.
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
                            autoFocus
                            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 disabled:opacity-60"
                >
                    {submitting ? "Sending…" : "Send reset link"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy-400">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-navy-700 hover:text-navy-900 hover:underline">
                    Back to login
                </Link>
            </p>
        </div>
    );
}
