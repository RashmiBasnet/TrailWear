"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
    handleAddCartItem,
    handleClearCart,
    handleGetCart,
    handleRemoveCartItem,
    handleUpdateCartItem,
} from "@/lib/actions/cart-action";

type CartSummary = {
    id: string | null;
    items: any[];
    subtotal: number;
};

type CartContextValue = {
    cart: CartSummary;
    loading: boolean;
    itemCount: number;
    addItem: (product: any, quantity?: number, size?: string) => Promise<any>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string, productName?: string) => Promise<void>;
    clear: () => Promise<void>;
    refresh: () => Promise<void>;
};

const emptyCart: CartSummary = {
    id: null,
    items: [],
    subtotal: 0,
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const [cart, setCart] = useState<CartSummary>(emptyCart);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        if (!user) {
            setCart(emptyCart);
            setLoading(false);
            return;
        }
        if (pathname === "/login" || pathname === "/signup") {
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await handleGetCart();
        if (result.success) {
            setCart(result.data.cart);
        }
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, [pathname, user]);

    const itemCount = useMemo(
        () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
        [cart.items]
    );

    const addItem = async (product: any, quantity = 1, size = "") => {
        if (!user) {
            toast.info("Log in to add items", "Your cart is saved to your account.");
            router.push("/login");
            return { success: false };
        }

        const result = await handleAddCartItem({ productId: product.id, quantity, size });
        if (result.success) {
            setCart(result.data.cart);
            toast.success("Added to cart", `${product.name} is in your cart.`);
        } else {
            toast.error("Could not add to cart", result.message || "Please try again.");
        }
        return result;
    };

    const updateItem = async (itemId: string, quantity: number) => {
        const previousCart = cart;
        setCart((current) => ({
            ...current,
            items: current.items
                .map((item) => (item.id === itemId ? { ...item, quantity } : item))
                .filter((item) => item.quantity > 0),
        }));

        const result = await handleUpdateCartItem(itemId, { quantity });
        if (result.success) {
            setCart(result.data.cart);
        } else {
            setCart(previousCart);
            toast.error("Could not update cart", result.message || "Please try again.");
        }
    };

    const removeItem = async (itemId: string, productName?: string) => {
        const previousCart = cart;
        setCart((current) => ({
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
        }));

        const result = await handleRemoveCartItem(itemId);
        if (result.success) {
            setCart(result.data.cart);
            toast.success("Removed from cart", productName ? `${productName} was removed.` : "Item removed.");
        } else {
            setCart(previousCart);
            toast.error("Could not remove item", result.message || "Please try again.");
        }
    };

    const clear = async () => {
        const previousCart = cart;
        setCart(emptyCart);

        const result = await handleClearCart();
        if (result.success) {
            setCart(result.data.cart);
            toast.success("Cart cleared", "All items were removed.");
        } else {
            setCart(previousCart);
            toast.error("Could not clear cart", result.message || "Please try again.");
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, itemCount, addItem, updateItem, removeItem, clear, refresh }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
};
