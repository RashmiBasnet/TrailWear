"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const { wishlist, loading: wishlistLoading, toggle } = useWishlist();
    const { addItem } = useCart();
    const [busyId, setBusyId] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return (
            <main className="flex flex-1 items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
            </main>
        );
    }

    const onAddToCart = async (product: any) => {
        setBusyId(product.id);
        await addItem(product);
        setBusyId("");
    };

    const onRemove = async (product: any) => {
        setBusyId(product.id);
        await toggle(product);
        setBusyId("");
    };

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">My wishlist</h1>
                <p className="mt-1 text-sm text-navy-400">
                    {wishlist.length} item{wishlist.length === 1 ? "" : "s"} saved for later
                </p>
            </div>

            {wishlistLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                </div>
            ) : wishlist.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-20 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100">
                        <Heart className="h-8 w-8 text-gold-500" />
                    </span>
                    <p className="mt-1 font-semibold text-navy-800">Your wishlist is empty.</p>
                    <p className="max-w-sm text-sm text-navy-400">
                        Save gear you like by tapping the heart icon, and find it here later.
                    </p>
                    <Link
                        href="/products"
                        className="mt-3 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Browse gear
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {wishlist.map((item: any) => {
                        const product = item.product;
                        const busy = busyId === product.id;
                        const inStock = Number(product.stock) > 0;

                        return (
                            <div
                                key={item.id}
                                className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
                            >
                                <Link href={`/products/${product.id}`} className="relative block h-44 bg-navy-50">
                                    {product.images?.[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onRemove(product);
                                        }}
                                        disabled={busy}
                                        aria-label="Remove from wishlist"
                                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-danger hover:bg-white disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    {!inStock && (
                                        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-navy-800/85 px-2.5 py-1 text-[11px] font-medium text-white">
                                            Out of stock
                                        </span>
                                    )}
                                </Link>

                                <div className="p-3.5">
                                    <p className="text-xs text-navy-300">{product.category?.name}</p>
                                    <Link href={`/products/${product.id}`}>
                                        <p className="mt-0.5 truncate text-sm font-medium text-navy-800 hover:text-navy-600">
                                            {product.name}
                                        </p>
                                    </Link>
                                    <p className="mt-2 text-base font-semibold text-navy-600">
                                        {formatPrice(Number(product.price))}
                                    </p>

                                    {product.sizes?.length > 0 ? (
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-navy-600 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            Select size
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onAddToCart(product)}
                                            disabled={busy || !inStock}
                                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-navy-600 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-navy-100 disabled:text-navy-300"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            {inStock ? "Add to cart" : "Unavailable"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
