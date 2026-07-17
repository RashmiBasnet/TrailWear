"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import GoogleButton from "@/app/_components/GoogleButton";
import { handleResendVerification } from "@/lib/actions/auth-action";

// Google's public test key: renders a widget that always passes. Replace via
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY with a real key from google.com/recaptcha/admin
const RECAPTCHA_SITE_KEY =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

/**
 * useSearchParams opts the tree out of prerendering, and Next refuses to build
 * without a boundary to fall back to. The form itself is the boundary's child so
 * only it waits on the URL, rather than the whole route.
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="w-full max-w-md" />}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const { user, loading, login, verifyMfa, verifyMfaBackupCode } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Google sign-in comes back as a redirect, so its outcome arrives in the URL
    // rather than as a return value: an error to show, or the second-factor step
    // to resume with the pending cookie already set.
    const [error, setError] = useState(searchParams.get("error") ?? "");
    const [mfaRequired, setMfaRequired] = useState(searchParams.get("mfa") === "required");

    const [mfaCode, setMfaCode] = useState("");
    const [useBackupCode, setUseBackupCode] = useState(false);

    // Password accepted but the email was never verified.
    const [needsVerification, setNeedsVerification] = useState(false);
    const [resending, setResending] = useState(false);

    // Required on every attempt; the server rejects a login without a valid token.
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA>(null);

    useEffect(() => {
        if (loading || !user || redirecting) return;
        router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }, [user, loading, redirecting, router]);

    // Those params have been read into state above; drop them so a refresh does
    // not resurrect a stale error or an MFA step whose pending token has expired.
    useEffect(() => {
        if (searchParams.get("error") || searchParams.get("mfa")) {
            router.replace("/login");
        }
    }, [searchParams, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setNeedsVerification(false);

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            toast.error("Missing login details", "Please enter your email and password.");
            return;
        }

        if (!captchaToken) {
            setError("Please complete the captcha below.");
            return;
        }

        setSubmitting(true);
        const result = await login({ email: email.trim(), password, captchaToken });
        setSubmitting(false);

        if (!result.success) {
            // Google tokens are single use, so a fresh one is needed either way.
            captchaRef.current?.reset();
            setCaptchaToken(null);

            const message = result.message || "Login failed.";
            setError(message);

            // Password was right, the address just isn't proven yet. Offer a
            // re-send rather than leaving them stuck on an error.
            if (result.emailVerificationRequired) {
                setNeedsVerification(true);
                toast.info("Verify your email", message);
                return;
            }

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

    const onResend = async () => {
        setResending(true);
        const result = await handleResendVerification(email.trim());
        setResending(false);
        toast.success("Check your inbox", result.message);
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
                {error && !needsVerification && (
                    <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}

                {needsVerification && (
                    <div className="rounded-xl border border-gold-300 bg-gold-50 px-4 py-3">
                        <p className="flex items-start gap-2 text-sm text-gold-800">
                            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={onResend}
                            disabled={resending}
                            className="mt-2 text-sm font-semibold text-navy-700 underline hover:text-navy-900 disabled:opacity-60"
                        >
                            {resending ? "Sending…" : "Send me a new link"}
                        </button>
                    </div>
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

                <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                />

                <button
                    type="submit"
                    disabled={submitting || !captchaToken}
                    className="w-full rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 disabled:opacity-60"
                >
                    {submitting ? "Logging in…" : "Log in"}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-navy-300">or</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleButton />

            {/* Shown to everyone, always. A Google-only account gets the same generic
                "invalid email or password" as any other failure — telling that user
                specifically to use Google would also tell an attacker which emails
                have accounts. A standing hint helps them and reveals nothing. */}
            <p className="mt-6 text-center text-xs text-navy-300">
                Signed up with Google? Use the button above rather than a password.
            </p>

            <p className="mt-8 text-center text-sm text-navy-400">
                New to TrailWear?{" "}
                <Link href="/signup" className="font-semibold text-navy-700 hover:text-navy-900 hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}
