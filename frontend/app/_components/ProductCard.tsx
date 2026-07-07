"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

export default function ProductCard({ product }: { product: any }) {
    const { user } = useAuth();
    const { isWishlisted, toggle } = useWishlist();
    const toast = useToast();
    const router = useRouter();
    const wishlisted = isWishlisted(product.id);

    const onWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.info("Log in to save items", "Your wishlist is saved to your account.");
            router.push("/login");
            return;
        }
        toggle(product);
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
        >
            <div className="relative h-44 bg-navy-50">
                {product.images?.[0] && (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                )}
                <button
                    type="button"
                    onClick={onWishlistClick}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-cream hover:bg-gold-200"
                >
                    <Heart className={`h-4 w-4 text-gold-700 ${wishlisted ? "fill-gold-700" : ""}`} />
                </button>
            </div>
            <div className="p-3.5">
                <p className="text-xs text-navy-300">{product.category?.name}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-navy-800 group-hover:text-navy-600">
                    {product.name}
                </p>
                <p className="mt-2 text-base font-semibold text-navy-600">
                    NRs. {Number(product.price).toFixed(2)}
                </p>
            </div>
        </Link>
    );
}
