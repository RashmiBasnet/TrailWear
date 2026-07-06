"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { user, loading, login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (loading || !user) return;
        router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }, [user, loading, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setSubmitting(true);
        const result = await login({ email: email.trim(), password });
        setSubmitting(false);

        if (result.success) {
            const role = result.data?.user?.role;
            router.replace(role === "ADMIN" ? "/admin" : "/");
        } else {
            setError(result.message || "Login failed.");
        }
    };

    return (
        <main className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-xl border border-border bg-white p-8">
                <div className="mb-6 text-center">
                    <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-cream">
                        <img src="/logo2.png" alt="TrailWear" className="h-7 w-auto" />
                    </span>
                    <h1 className="text-2xl font-bold text-navy-800">Welcome back</h1>
                    <p className="mt-1 text-sm text-navy-400">Log in to your TrailWear account.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-800">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-800">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 pr-10 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                    >
                        {submitting ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-navy-400">
                    New to TrailWear?{" "}
                    <Link href="/signup" className="font-medium text-navy-600 hover:text-navy-800">
                        Create an account
                    </Link>
                </p>
            </div>
        </main>
    );
}
