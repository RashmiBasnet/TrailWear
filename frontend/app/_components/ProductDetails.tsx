"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    ChevronRight,
    Heart,
    ImageOff,
    Minus,
    Plus,
    RotateCcw,
    ShieldCheck,
    ShoppingCart,
    Truck,
    XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";

const genderLabels: Record<string, string> = {
    MEN: "Men",
    WOMEN: "Women",
    UNISEX: "Unisex",
};

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

export default function ProductDetails({ product }: { product: any }) {
    const images = useMemo(() => product.images ?? [], [product.images]);
    const sizes: string[] = useMemo(() => product.sizes ?? [], [product.sizes]);
    const [selectedImage, setSelectedImage] = useState(images[0] ?? "");
    const [selectedSize, setSelectedSize] = useState("");
    const [sizeError, setSizeError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const { user } = useAuth();
    const { addItem } = useCart();
    const { isWishlisted, toggle } = useWishlist();
    const toast = useToast();
    const router = useRouter();
    const wishlisted = isWishlisted(product.id);
    const price = Number(product.price);
    const stock = Number(product.stock) || 0;
    const inStock = stock > 0;
    const lowStock = inStock && stock <= 5;
    const maxQuantity = Math.max(1, stock);

    const onWishlistClick = () => {
        if (!user) {
            toast.info("Log in to save items", "Your wishlist is saved to your account.");
            router.push("/login");
            return;
        }
        toggle(product);
    };

    const ensureSize = () => {
        if (sizes.length > 0 && !selectedSize) {
            setSizeError(true);
            return false;
        }
        setSizeError(false);
        return true;
    };

    const onAddToCart = async () => {
        if (!ensureSize()) return;
        setAdding(true);
        await addItem(product, quantity, selectedSize);
        setAdding(false);
    };

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-28 lg:pb-8">
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-navy-400">
                <Link href="/" className="font-medium hover:text-navy-700">
                    Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                {product.category?.slug ? (
                    <Link href={`/categories/${product.category.slug}`} className="font-medium hover:text-navy-700">
                        {product.category.name}
                    </Link>
                ) : (
                    <Link href="/products" className="font-medium hover:text-navy-700">
                        All gear
                    </Link>
                )}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-navy-600">{product.name}</span>
            </nav>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                <div>
                    <div className="group aspect-square overflow-hidden rounded-xl border border-border bg-navy-50">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-navy-300">
                                <ImageOff className="h-8 w-8" />
                                <p className="text-sm">No image available</p>
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                            {images.map((src: string, index: number) => (
                                <button
                                    key={`${src}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedImage(src)}
                                    aria-label={`View image ${index + 1}`}
                                    className={`aspect-square overflow-hidden rounded-lg bg-navy-50 transition ${
                                        selectedImage === src
                                            ? "ring-2 ring-navy-600 ring-offset-2"
                                            : "border border-border opacity-80 hover:opacity-100"
                                    }`}
                                >
                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:sticky lg:top-24 lg:self-start lg:pt-2">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-navy-400">
                                {product.category?.name}
                            </p>
                            <h1 className="mt-1 text-3xl font-bold leading-tight text-navy-800">
                                {product.name}
                            </h1>
                        </div>
                        <button
                            type="button"
                            onClick={onWishlistClick}
                            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-cream text-gold-700 transition active:scale-95 hover:bg-gold-200"
                        >
                            <Heart className={`h-5 w-5 ${wishlisted ? "fill-gold-700" : ""}`} />
                        </button>
                    </div>

                    <p className="mt-4 text-2xl font-bold tabular-nums text-navy-600">
                        {formatPrice(price)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-medium text-navy-600">
                            {genderLabels[product.gender] || product.gender}
                        </span>
                        <span
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                !inStock
                                    ? "bg-danger/10 text-danger"
                                    : lowStock
                                        ? "bg-gold-100 text-gold-700"
                                        : "bg-success/10 text-success"
                            }`}
                        >
                            {inStock ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            {!inStock
                                ? "Out of stock"
                                : lowStock
                                    ? `Only ${stock} left`
                                    : "In stock"}
                        </span>
                    </div>

                    {sizes.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-navy-800">
                                    Size
                                    {selectedSize && (
                                        <span className="text-navy-400"> · {selectedSize}</span>
                                    )}
                                </p>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSize(size);
                                            setSizeError(false);
                                        }}
                                        aria-pressed={selectedSize === size}
                                        className={`min-w-11 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                                            selectedSize === size
                                                ? "border-navy-600 bg-navy-600 text-white"
                                                : "border-border text-navy-600 hover:border-navy-400"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {sizeError && (
                                <p className="mt-1.5 text-xs text-danger">Please select a size.</p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex w-max items-center overflow-hidden rounded-full border border-border bg-white">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                    className="flex h-11 w-11 items-center justify-center text-navy-500 hover:bg-navy-50 disabled:opacity-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="flex h-11 min-w-12 items-center justify-center px-3 text-sm font-semibold tabular-nums text-navy-800">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((value) => Math.min(maxQuantity, value + 1))
                                    }
                                    disabled={!inStock || quantity >= maxQuantity}
                                    aria-label="Increase quantity"
                                    className="flex h-11 w-11 items-center justify-center text-navy-500 hover:bg-navy-50 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={onAddToCart}
                                disabled={!inStock || adding}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {adding ? "Adding…" : "Add to cart"}
                            </button>
                        </div>

                        {quantity > 1 && (
                            <p className="text-center text-xs text-navy-400">
                                Subtotal:{" "}
                                <span className="font-semibold tabular-nums text-navy-700">
                                    {formatPrice(price * quantity)}
                                </span>{" "}
                                ({quantity} items)
                            </p>
                        )}
                    </div>

                    <div className="mt-8 space-y-3 border-t border-border pt-5 text-sm text-navy-400">
                        <p className="flex items-center gap-2">
                            <Truck className="h-4 w-4 shrink-0 text-navy-300" />
                            Free delivery on orders over NRs. 10,000.
                        </p>
                        <p className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 shrink-0 text-navy-300" />
                            Easy 30-day returns on unused gear.
                        </p>
                        <p className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-navy-300" />
                            Secure checkout with eSewa or Cash on Delivery.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-10 max-w-2xl">
                <h2 className="text-base font-semibold text-navy-800">Description</h2>
                <p className="mt-2 whitespace-pre-line leading-7 text-navy-600">
                    {product.description}
                </p>
            </section>

            {/* Sticky add-to-cart bar for mobile */}
            <div
                className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    <div className="shrink-0">
                        <p className="text-[11px] text-navy-400">Price</p>
                        <p className="text-base font-bold tabular-nums text-navy-800">
                            {formatPrice(price * quantity)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onAddToCart}
                        disabled={!inStock || adding}
                        className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {!inStock ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
                    </button>
                </div>
            </div>
        </main>
    );
}
