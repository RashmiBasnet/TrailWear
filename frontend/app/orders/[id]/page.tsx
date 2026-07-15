import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    Truck,
    XCircle,
} from "lucide-react";
import { handleGetOrderById } from "@/lib/actions/order-action";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const statusStyles: Record<string, { badge: string; dot: string }> = {
    PENDING: { badge: "bg-gold-100 text-gold-700", dot: "bg-gold-500" },
    CONFIRMED: { badge: "bg-navy-50 text-navy-600", dot: "bg-navy-400" },
    SHIPPED: { badge: "bg-navy-100 text-navy-700", dot: "bg-navy-600" },
    DELIVERED: { badge: "bg-success/10 text-success", dot: "bg-success" },
    CANCELLED: { badge: "bg-danger/10 text-danger", dot: "bg-danger" },
};

const paymentStatusStyles: Record<string, string> = {
    PAID: "bg-success/10 text-success",
    PENDING: "bg-gold-100 text-gold-700",
    FAILED: "bg-danger/10 text-danger",
};

const paymentStatusLabels: Record<string, string> = {
    PAID: "Paid",
    PENDING: "Awaiting payment",
    FAILED: "Failed",
};

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ placed?: string }>;
}) {
    const { id } = await params;
    const { placed } = await searchParams;
    const result = await handleGetOrderById(id);

    if (!result.success) {
        notFound();
    }

    const order = result.data.order;
    const status = statusStyles[order.status] || statusStyles.CONFIRMED;
    const isCancelled = order.status === "CANCELLED";
    const justPlaced = placed === "1";

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-400 hover:text-navy-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to orders
            </Link>

            {justPlaced && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-5 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <div>
                        <p className="font-semibold text-navy-800">Order placed successfully</p>
                        <p className="mt-0.5 text-sm text-navy-500">
                            Thanks for your order — a confirmation is on its way. You can track its
                            progress below.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">
                        Order{" "}
                        <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                    </h1>
                    <p className="mt-1 text-sm text-navy-400">
                        Placed on {formatDateTime(order.createdAt)}
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {statusLabels[order.status] || order.status}
                </span>
            </div>

            {isCancelled && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-5 py-4">
                    <XCircle className="h-5 w-5 shrink-0 text-danger" />
                    <p className="text-sm text-navy-600">
                        This order was cancelled. If this wasn&apos;t expected, please reach out to
                        support.
                    </p>
                </div>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
                <section className="rounded-xl border border-border bg-white">
                    <h2 className="flex items-center gap-2 border-b border-border px-5 py-4 text-base font-semibold text-navy-800">
                        <Package className="h-4 w-4" />
                        Items
                        <span className="ml-auto text-sm font-normal text-navy-400">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                    </h2>
                    <div>
                        {order.items.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 border-b border-border p-4 last:border-0"
                            >
                                <Link
                                    href={`/products/${item.product.id}`}
                                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50"
                                >
                                    {item.product.images?.[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/products/${item.product.id}`}
                                        className="font-medium text-navy-800 hover:text-navy-600"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <p className="mt-0.5 text-sm text-navy-400">
                                        Qty {item.quantity}
                                        {item.size && ` · Size ${item.size}`}
                                        {" · "}
                                        {formatPrice(item.price)} each
                                    </p>
                                </div>
                                <p className="shrink-0 font-semibold tabular-nums text-navy-800">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="rounded-xl border border-border bg-white p-5">
                        <h2 className="text-base font-semibold text-navy-800">Order summary</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between text-navy-500">
                                <span>Subtotal</span>
                                <span className="font-medium tabular-nums text-navy-800">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-navy-500">
                                <span className="flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5" />
                                    Delivery
                                </span>
                                <span className="text-success">Free</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                            <span className="font-semibold text-navy-800">Total</span>
                            <span className="text-lg font-bold tabular-nums text-navy-800">
                                {formatPrice(order.total)}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-5">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                            <CreditCard className="h-4 w-4" />
                            Payment
                        </h2>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-navy-600">
                                {order.paymentMethod === "ESEWA" ? "eSewa" : "Cash on Delivery"}
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    paymentStatusStyles[order.paymentStatus] ||
                                    paymentStatusStyles.PENDING
                                }`}
                            >
                                {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {order.address && (
                        <div className="rounded-xl border border-border bg-white p-5">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                                <MapPin className="h-4 w-4" />
                                Delivery address
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-navy-600">
                                {order.address.line1}
                                {order.address.line2 && (
                                    <>
                                        <br />
                                        {order.address.line2}
                                    </>
                                )}
                                <br />
                                {order.address.city}, {order.address.country} {order.address.zip}
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            <div className="mt-8">
                <Link
                    href="/products"
                    className="inline-flex rounded-full border border-navy-600 px-6 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
}
