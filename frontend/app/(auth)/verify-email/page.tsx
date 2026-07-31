"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { handleVerifyEmail } from "@/lib/actions/auth-action";
import { useCsrf } from "@/app/_components/CsrfProvider";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="w-full max-w-md" />}>
            <VerifyEmail />
        </Suspense>
    );
}

type State = "working" | "done" | "failed";

function VerifyEmail() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const csrfToken = useCsrf();

    const [state, setState] = useState<State>("working");
    const [message, setMessage] = useState("");

    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        if (!token) {
            setState("failed");
            setMessage("This link is missing its verification token.");
            return;
        }

        handleVerifyEmail(csrfToken, token).then((result) => {
            setState(result.success ? "done" : "failed");
            setMessage(result.message);
        });
    }, [token]);

    if (state === "working") {
        return (
            <div className="w-full max-w-md text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-400" />
                <p className="mt-4 text-sm text-navy-400">Verifying your email…</p>
            </div>
        );
    }

    if (state === "done") {
        return (
            <div className="w-full max-w-md text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                    Email verified
                </h1>
                <p className="mt-2 text-sm text-navy-400">{message}</p>
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
        <div className="w-full max-w-md text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <AlertCircle className="h-6 w-6 text-danger" />
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-800">
                Link didn&apos;t work
            </h1>
            <p className="mt-2 text-sm text-navy-400">{message}</p>
            <p className="mt-2 text-xs text-navy-300">
                Verification links expire after 24 hours and can only be used once.
                Try logging in to send yourself a new one.
            </p>
            <Link
                href="/login"
                className="mt-8 inline-block w-full rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition hover:bg-navy-50"
            >
                Back to login
            </Link>
        </div>
    );
}
