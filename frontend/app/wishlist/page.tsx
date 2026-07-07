"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/app/_components/ProductCard";

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const { wishlist, loading: wishlistLoading } = useWishlist();
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

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">My wishlist</h1>
                <p className="mt-1 text-sm text-navy-400">
                    {wishlist.length} item{wishlist.length === 1 ? "" : "s"}
                </p>
            </div>

            {wishlistLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                </div>
            ) : wishlist.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-16 text-center">
                    <Heart className="h-8 w-8 text-navy-200" />
                    <p className="text-navy-400">Your wishlist is empty.</p>
                    <Link
                        href="/products"
                        className="mt-2 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Browse gear
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {wishlist.map((item: any) => (
                        <ProductCard key={item.id} product={item.product} />
                    ))}
                </div>
            )}
        </main>
    );
}
