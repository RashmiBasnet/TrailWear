import Link from "next/link";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { handleGetOrders } from "@/lib/actions/order-action";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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

const defaultStatus = { badge: "bg-navy-50 text-navy-600", dot: "bg-navy-400" };

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const result = await handleGetOrders();

    const orders: any[] = result.success ? result.data.orders : [];

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">My orders</h1>
                <p className="mt-1 text-sm text-navy-400">
                    {orders.length === 0
                        ? "Track and review the orders you've placed."
                        : `${orders.length} order${orders.length === 1 ? "" : "s"} placed`}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-20 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100">
                        <ShoppingBag className="h-8 w-8 text-gold-500" />
                    </span>
                    <p className="mt-1 font-semibold text-navy-800">No orders yet</p>
                    <p className="max-w-sm text-sm text-navy-400">
                        When you place an order, you&apos;ll be able to track it and view its
                        details right here.
                    </p>
                    <Link
                        href="/products"
                        className="mt-3 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Start shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const status = statusStyles[order.status] || defaultStatus;
                        const names = order.items
                            .map((item: any) => item.product.name)
                            .join(", ");

                        return (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="group block overflow-hidden rounded-xl border border-border bg-white transition hover:border-navy-300 hover:shadow-md"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-navy-50/40 px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-semibold text-navy-800">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </span>
                                        <span className="hidden h-3.5 w-px bg-border sm:block" />
                                        <span className="text-xs text-navy-400">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                        {statusLabels[order.status] || order.status}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                                    <div className="flex -space-x-2.5">
                                        {order.items.slice(0, 4).map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50 ring-2 ring-white"
                                            >
                                                {item.product.images?.[0] && (
                                                    <img
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-navy-50 text-xs font-medium text-navy-500 ring-2 ring-white">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-navy-800">
                                            {names}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-400">
                                            <Package className="h-3.5 w-3.5" />
                                            {order.items.length}{" "}
                                            {order.items.length === 1 ? "item" : "items"}
                                            <span className="text-navy-200">·</span>
                                            {order.paymentMethod === "ESEWA"
                                                ? "Paid with eSewa"
                                                : "Cash on Delivery"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:gap-1 sm:border-t-0 sm:pt-0">
                                        <span className="text-base font-bold tabular-nums text-navy-800">
                                            {formatPrice(order.total)}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs font-medium text-navy-500 transition-colors group-hover:text-navy-800">
                                            View details
                                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
