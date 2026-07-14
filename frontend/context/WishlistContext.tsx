"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
} from "@/lib/actions/wishlist-action";
import { useToast } from "@/context/ToastContext";

const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const toast = useToast();
    const pathname = usePathname();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user) {
                setWishlist([]);
                setLoading(false);
                return;
            }
            if (pathname === "/login" || pathname === "/signup") {
                setLoading(false);
                return;
            }
            setLoading(true);
            const result = await handleGetWishlist();
            if (result.success) {
                setWishlist(result.data.wishlist);
            }
            setLoading(false);
        };
        load();
    }, [pathname, user]);

    const isWishlisted = (productId: string) =>
        wishlist.some((item) => item.product.id === productId);

    const toggle = async (product: any) => {
        if (isWishlisted(product.id)) {
            const previousWishlist = wishlist;
            setWishlist((prev) => prev.filter((item) => item.product.id !== product.id));
            const result = await handleRemoveFromWishlist(product.id);
            if (result.success) {
                setWishlist(result.data.wishlist);
                toast.success("Removed from wishlist", `${product.name} was removed.`);
            } else {
                setWishlist(previousWishlist);
                toast.error("Could not update wishlist", result.message || "Please try again.");
            }
        } else {
            const previousWishlist = wishlist;
            setWishlist((prev) => [
                { id: `optimistic-${product.id}`, addedAt: new Date().toISOString(), product },
                ...prev,
            ]);
            const result = await handleAddToWishlist(product.id);
            if (result.success) {
                setWishlist(result.data.wishlist);
                toast.success("Added to wishlist", `${product.name} is saved for later.`);
            } else {
                setWishlist(previousWishlist);
                toast.error("Could not update wishlist", result.message || "Please try again.");
            }
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, isWishlisted, toggle }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within WishlistProvider");
    }
    return context;
};
