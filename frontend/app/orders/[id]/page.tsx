import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Package } from "lucide-react";
import { handleGetOrderById } from "@/lib/actions/order-action";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await handleGetOrderById(id);

    if (!result.success) {
        notFound();
    }

    const order = result.data.order;

    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-navy-800">Order placed!</h1>
                <p className="mt-1 text-sm text-navy-400">
                    Order #{order.id.slice(-8).toUpperCase()} · {statusLabels[order.status] || order.status}
                </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white">
                {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50">
                            {item.product.images?.[0] && (
                                <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-navy-800">{item.product.name}</p>
                            <p className="text-sm text-navy-400">
                                Qty {item.quantity}
                                {item.size && ` · Size ${item.size}`}
                            </p>
                        </div>
                        <p className="font-semibold text-navy-800">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {order.address && (
                    <div className="rounded-xl border border-border bg-white p-5">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                            <MapPin className="h-4 w-4" />
                            Delivery address
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-navy-600">
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

                <div className="rounded-xl border border-border bg-white p-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                        <Package className="h-4 w-4" />
                        Order total
                    </h2>
                    <p className="mt-2 text-2xl font-bold text-navy-800">{formatPrice(order.total)}</p>
                    <p className="mt-1 text-xs text-navy-400">Cash on Delivery</p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link
                    href="/products"
                    className="rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
}
