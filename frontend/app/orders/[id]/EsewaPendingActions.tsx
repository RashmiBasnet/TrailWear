"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet, XCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { handleResumeEsewa, handleCancelOrder } from "@/lib/actions/order-action";
import { useCsrf } from "@/app/_components/CsrfProvider";

export default function EsewaPendingActions({ orderId }: { orderId: string }) {
    const router = useRouter();
    const toast = useToast();
    const csrfToken = useCsrf();
    const [resuming, setResuming] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const onComplete = async () => {
        setResuming(true);
        const result = await handleResumeEsewa(csrfToken, orderId);

        if (result.success && result.data.formUrl) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = result.data.formUrl;
            Object.entries(result.data.fields).forEach(([name, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.value = String(value);
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
            return;
        }

        setResuming(false);
        toast.error("Could not resume payment", result.message || "Please try again.");
        // Backend may have detected the order was already paid or is no longer
        // resumable — refresh so the page reflects the current status.
        router.refresh();
    };

    const onCancel = async () => {
        if (!window.confirm("Cancel this order? This can't be undone.")) return;

        setCancelling(true);
        const result = await handleCancelOrder(csrfToken, orderId);
        setCancelling(false);

        if (result.success) {
            toast.success("Order cancelled", "The pending order has been cancelled.");
            router.refresh();
        } else {
            toast.error("Could not cancel order", result.message || "Please try again.");
        }
    };

    return (
        <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50/60 px-5 py-4">
            <p className="font-semibold text-navy-800">Payment not completed</p>
            <p className="mt-0.5 text-sm text-navy-500">
                Your payment for this order is still pending. Complete it with eSewa to confirm
                the order, or cancel it if you&apos;ve changed your mind.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onComplete}
                    disabled={resuming || cancelling}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#60bb46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#54a63d] disabled:opacity-60"
                >
                    {resuming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="h-4 w-4" />
                    )}
                    {resuming ? "Redirecting to eSewa…" : "Complete payment"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={resuming || cancelling}
                    className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 px-5 py-2.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-60"
                >
                    {cancelling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    {cancelling ? "Cancelling…" : "Cancel order"}
                </button>
            </div>
        </div>
    );
}
