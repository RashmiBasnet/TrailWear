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
    const inStock = Number(product.stock) > 0;
    const maxQuantity = Math.max(1, Number(product.stock) || 1);

    const onWishlistClick = () => {
        if (!user) {
            toast.info("Log in to save items", "Your wishlist is saved to your account.");
            router.push("/login");
            return;
        }
        toggle(product);
    };

    const onAddToCart = async () => {
        if (sizes.length > 0 && !selectedSize) {
            setSizeError(true);
            return;
        }
        setSizeError(false);
        setAdding(true);
        await addItem(product, quantity, selectedSize);
        setAdding(false);
    };

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
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
                                    className={`aspect-square overflow-hidden rounded-lg border bg-navy-50 ${
                                        selectedImage === src ? "border-navy-600" : "border-border"
                                    }`}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:pt-2">
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
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-cream text-gold-700 hover:bg-gold-200"
                        >
                            <Heart className={`h-5 w-5 ${wishlisted ? "fill-gold-700" : ""}`} />
                        </button>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-navy-600">
                        {formatPrice(Number(product.price))}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-medium text-navy-600">
                            {genderLabels[product.gender] || product.gender}
                        </span>
                        <span
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                inStock
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                            }`}
                        >
                            {inStock ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            {inStock ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                    </div>

                    <p className="mt-6 leading-7 text-navy-600">
                        {product.description}
                    </p>

                    {sizes.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-navy-800">
                                    Size{selectedSize && <span className="text-navy-400"> · {selectedSize}</span>}
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

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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
                            <span className="flex h-11 min-w-12 items-center justify-center px-3 text-sm font-semibold text-navy-800">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
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
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-600 px-7 py-3 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {adding ? "Adding..." : "Add to cart"}
                        </button>
                    </div>

                    {inStock && quantity >= maxQuantity && (
                        <p className="mt-2 text-xs text-gold-600">Only {maxQuantity} in stock.</p>
                    )}

                    <div className="mt-8 space-y-3 border-t border-border pt-5 text-sm text-navy-400">
                        <p className="flex items-center gap-2">
                            <Truck className="h-4 w-4 shrink-0 text-navy-300" />
                            Free delivery on orders over NRs. 10,000.
                        </p>
                        <p className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 shrink-0 text-navy-300" />
                            Easy 30-day returns on unused gear.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
