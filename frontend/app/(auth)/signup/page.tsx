"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import PasswordStrengthMeter, {
    MINIMUM_SCORE,
    scorePassword,
} from "@/app/_components/PasswordStrengthMeter";
import GoogleButton from "@/app/_components/GoogleButton";

// Mirrors the regex rules the backend enforces, shown as a live checklist.
// Meeting these is necessary but not sufficient — the zxcvbn score decides.
const PASSWORD_REQUIREMENTS = [
    { key: "length", label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { key: "case", label: "Upper & lowercase letters", test: (pw: string) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { key: "number", label: "At least one number", test: (pw: string) => /\d/.test(pw) },
];

export default function SignupPage() {
    const { user, loading, register } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState("");

    const userInputs = useMemo(() => [name, email, "trailwear"], [name, email]);
    const strengthScore = useMemo(
        () => scorePassword(password, userInputs)?.score ?? 0,
        [password, userInputs]
    );
    const meetsRules = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
    const isStrong = meetsRules && strengthScore >= MINIMUM_SCORE;

    useEffect(() => {
        if (loading || !user || redirecting) return;
        router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }, [user, loading, redirecting, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            toast.error("Missing signup details", "Please fill in all fields.");
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
        const result = await register({ name: name.trim(), email: email.trim(), password });
        setSubmitting(false);

        if (result.success) {
            const role = result.data?.user?.role;
            setRedirecting(true);
            toast.success("Account created", "Welcome to TrailWear.");
            router.replace(role === "ADMIN" ? "/admin" : "/");
        } else {
            const message = result.message || "Registration failed.";
            setError(message);
            toast.error("Registration failed", message);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-navy-800">Create your account</h1>
            <p className="mt-2 text-sm text-navy-400">
                Join TrailWear and gear up for the trail.
            </p>

            {/* Same endpoint as on the login page: Google sign-in creates the account
                if there is none, so there is nothing separate to "sign up" with. */}
            <div className="mt-8">
                <GoogleButton label="Sign up with Google" />
            </div>

            <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-navy-300">or</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                {error && (
                    <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}

                <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-navy-800">
                        Name
                    </label>
                    <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tenzing Sherpa"
                            autoComplete="name"
                            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                    </div>
                </div>

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
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
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
                        Confirm password
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
                    {submitting ? "Creating account…" : "Create account"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-navy-700 hover:text-navy-900 hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
