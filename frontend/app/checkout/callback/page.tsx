"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { handleVerifyEsewa } from "@/lib/actions/order-action";
import { useCsrf } from "@/app/_components/CsrfProvider";

function EsewaCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const toast = useToast();
    const csrfToken = useCsrf();
    const { refresh } = useCart();
    const [error, setError] = useState("");
    const verifiedRef = useRef(false);

    const data = searchParams.get("data");
    const failed = searchParams.get("status") === "failure";

    useEffect(() => {
        if (verifiedRef.current) return;
        verifiedRef.current = true;

        const verify = async () => {
            if (failed || !data) {
                setError("Your payment was cancelled or could not be completed.");
                return;
            }

            const result = await handleVerifyEsewa(csrfToken, data);
            if (result.success) {
                await refresh();
                toast.success("Payment successful", "Thanks for your order!");
                router.replace(`/orders/${result.data.order.id}?placed=1`);
            } else {
                setError(result.message || "We couldn't verify your payment.");
            }
        };

        verify();
    }, [data, failed, refresh, router, toast]);

    if (error) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
                    <AlertCircle className="h-7 w-7 text-danger" />
                </span>
                <p className="mt-1 font-semibold text-navy-800">Payment not completed</p>
                <p className="max-w-sm text-sm text-navy-400">{error}</p>
                <Link
                    href="/cart"
                    className="mt-3 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                >
                    Back to cart
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
            <p className="font-medium text-navy-800">Verifying your payment…</p>
            <p className="text-sm text-navy-400">Please don't close this window.</p>
        </div>
    );
}

export default function EsewaCallbackPage() {
    return (
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
            <Suspense
                fallback={
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
                    </div>
                }
            >
                <EsewaCallback />
            </Suspense>
        </main>
    );
}
