"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const { cart, loading: cartLoading, updateItem, removeItem, clear } = useCart();
    const [updatingItemId, setUpdatingItemId] = useState("");
    const [clearing, setClearing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    const onQuantityChange = async (itemId: string, quantity: number) => {
        setUpdatingItemId(itemId);
        await updateItem(itemId, quantity);
        setUpdatingItemId("");
    };

    const onRemove = async (itemId: string, productName: string) => {
        setUpdatingItemId(itemId);
        await removeItem(itemId, productName);
        setUpdatingItemId("");
    };

    const onClear = async () => {
        if (!confirm("Clear your cart?")) return;
        setClearing(true);
        await clear();
        setClearing(false);
    };

    if (authLoading || !user) {
        return (
            <main className="flex flex-1 items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
            </main>
        );
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">My cart</h1>
                    <p className="mt-1 text-sm text-navy-400">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
                </div>
                {cart.items.length > 0 && (
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={clearing}
                        className="flex items-center gap-1.5 rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-60"
                    >
                        <Trash2 className="h-4 w-4" />
                        {clearing ? "Clearing..." : "Clear cart"}
                    </button>
                )}
            </div>

            {cartLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                </div>
            ) : cart.items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-20 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50">
                        <ShoppingBag className="h-8 w-8 text-navy-300" />
                    </span>
                    <p className="mt-1 font-semibold text-navy-800">Your cart is empty.</p>
                    <p className="max-w-sm text-sm text-navy-400">
                        Add trekking gear to your cart and come back here when you are ready.
                    </p>
                    <Link
                        href="/products"
                        className="mt-3 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Browse gear
                    </Link>
                </div>
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="overflow-hidden rounded-xl border border-border bg-white">
                        {cart.items.map((item: any) => {
                            const product = item.product;
                            const lineTotal = Number(product.price) * item.quantity;
                            const updating = updatingItemId === item.id;
                            const stock = Number(product.stock);
                            const atStockLimit = Number.isFinite(stock) && stock > 0 && item.quantity >= stock;

                            return (
                                <div
                                    key={item.id}
                                    className="group grid gap-4 border-b border-border p-4 transition-colors last:border-0 hover:bg-navy-50/40 sm:grid-cols-[96px_1fr_auto]"
                                >
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-navy-50"
                                    >
                                        {product.images?.[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        )}
                                    </Link>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {product.category?.name && (
                                                <span className="inline-block rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-500">
                                                    {product.category.name}
                                                </span>
                                            )}
                                            {item.size && (
                                                <span className="inline-block rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-500">
                                                    Size {item.size}
                                                </span>
                                            )}
                                        </div>
                                        <Link href={`/products/${product.id}`}>
                                            <h2 className="mt-1 font-semibold text-navy-800 hover:text-navy-600">
                                                {product.name}
                                            </h2>
                                        </Link>
                                        <p className="mt-1 text-sm text-navy-400">
                                            {formatPrice(Number(product.price))} each
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                            <div className="flex w-max items-center overflow-hidden rounded-full border border-border">
                                                <button
                                                    type="button"
                                                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={updating || item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                    className="flex h-9 w-9 items-center justify-center text-navy-500 hover:bg-navy-50 disabled:opacity-40"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="flex h-9 min-w-10 items-center justify-center px-2 text-sm font-semibold text-navy-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={updating || atStockLimit}
                                                    aria-label="Increase quantity"
                                                    className="flex h-9 w-9 items-center justify-center text-navy-500 hover:bg-navy-50 disabled:opacity-40"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onRemove(item.id, product.name)}
                                                disabled={updating}
                                                className="flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-danger disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>

                                        {atStockLimit && (
                                            <p className="mt-2 text-xs text-gold-600">Only {stock} in stock.</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                                        <p className="font-semibold text-navy-800">{formatPrice(lineTotal)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="sticky top-24 h-max rounded-xl border border-border bg-white p-5">
                        <h2 className="text-base font-semibold text-navy-800">Order summary</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between text-navy-500">
                                <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                                <span className="font-medium text-navy-800">{formatPrice(cart.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-navy-500">
                                <span className="flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5" />
                                    Delivery
                                </span>
                                <span>Calculated at checkout</span>
                            </div>
                        </div>
                        <div className="mt-5 border-t border-border pt-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-navy-800">Total</span>
                                <span className="text-lg font-bold text-navy-800">{formatPrice(cart.subtotal)}</span>
                            </div>
                        </div>
                        <Link
                            href="/checkout"
                            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700"
                        >
                            <Lock className="h-3.5 w-3.5" />
                            Checkout
                        </Link>
                        <Link
                            href="/products"
                            className="mt-3 block rounded-full border-2 border-navy-600 px-6 py-2.5 text-center text-sm font-medium text-navy-600 hover:bg-navy-50"
                        >
                            Continue shopping
                        </Link>

                        <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-border pt-4 text-xs text-navy-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Secure checkout · Visa · Mastercard · eSewa · Khalti
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
