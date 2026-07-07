"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, User, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { handleGetAllCategories } from "@/lib/actions/category-action";

const CATEGORY_GROUPS = [
    { name: "Clothing", slugs: ["base-layers", "outer-layers", "jackets", "pants"] },
    { name: "Gears", slugs: ["backpacks", "equipment", "sleeping-bags", "tents", "accessories"] },
];
const FOOTWEAR_SLUG = "shoes";

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const { wishlist } = useWishlist();
    const toast = useToast();
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    useEffect(() => {
        const load = async () => {
            const result = await handleGetAllCategories();
            if (result.success) {
                setCategories(
                    result.data.categories.map((category: any) => ({
                        name: category.name,
                        slug: category.slug,
                    }))
                );
            }
        };
        load();
    }, []);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (categoryNavRef.current && !categoryNavRef.current.contains(e.target as Node)) {
                setOpenGroup(null);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const findCategory = (slug: string) => categories.find((c) => c.slug === slug);
    const footwear = findCategory(FOOTWEAR_SLUG);

    const activeCategorySlug = pathname?.startsWith("/categories/") ? pathname.split("/")[2] : null;
    const isAllGearActive = pathname === "/products";
    const isFootwearActive = Boolean(footwear && activeCategorySlug === footwear.slug);
    const navLinkClass = (active: boolean) =>
        `whitespace-nowrap ${active ? "text-gold-300" : "text-navy-200 hover:text-gold-300"}`;

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search.trim())}`);
        }
    };

    const onLogout = async () => {
        const result = await logout();
        if (result.success) {
            toast.success("Logged out", "See you on the next trail.");
        } else {
            toast.error("Logout failed", result.message || "Please try again.");
        }
    };

    return (
        <header>
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
                <Link href="/" className="flex items-center">
                    <img src="/logo.png" alt="TrailWear" className="h-12 w-auto" />
                </Link>
                <form onSubmit={onSearch} className="relative hidden flex-1 max-w-sm md:block">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jackets, boots, tents…"
                        className="w-full rounded-full border border-border bg-white py-2 pl-4 pr-10 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                    />
                    <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                        <Search className="h-4 w-4" />
                    </button>
                </form>
                <nav className="ml-auto flex items-center gap-5 text-navy-600">
                    <Link href="/wishlist" aria-label="Wishlist" className="relative hover:text-navy-800">
                        <Heart className="h-5 w-5" />
                        {user && wishlist.length > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-semibold text-navy-800">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>
                    <Link href="/cart" aria-label="Cart" className="hover:text-navy-800">
                        <ShoppingCart className="h-5 w-5" />
                    </Link>
                    {user?.role === "ADMIN" && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 text-sm font-medium text-navy-600 hover:bg-navy-100"
                        >
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </Link>
                    )}
                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-1.5 text-sm font-medium hover:text-navy-800">
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                                </Link>
                                <button onClick={onLogout} aria-label="Logout" className="text-navy-400 hover:text-navy-800">
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="rounded-full border-2 border-navy-600 px-4 py-1 text-sm font-medium text-navy-600 hover:bg-navy-50">
                                    Log in
                                </Link>
                                <Link href="/signup" className="rounded-full bg-navy-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-navy-700">
                                    Sign up
                                </Link>
                            </div>
                        )
                    )}
                </nav>
            </div>
            {!isAdmin && (
                <div className="bg-navy-600">
                    <nav
                        ref={categoryNavRef}
                        className="relative mx-auto flex max-w-6xl items-center gap-6 px-4 py-2.5 text-sm font-medium"
                    >
                        <Link href="/products" className={navLinkClass(isAllGearActive)}>All gear</Link>

                        {CATEGORY_GROUPS.map((group) => {
                            const items = group.slugs
                                .map(findCategory)
                                .filter((item): item is { name: string; slug: string } => Boolean(item));

                            if (items.length === 0) return null;

                            const isGroupActive = items.some((item) => item.slug === activeCategorySlug);

                            return (
                                <div key={group.name} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setOpenGroup((g) => (g === group.name ? null : group.name))}
                                        className={`flex items-center gap-1 ${navLinkClass(isGroupActive)}`}
                                    >
                                        {group.name}
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform ${
                                                openGroup === group.name ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                    {openGroup === group.name && (
                                        <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-white py-2 shadow-lg">
                                            {items.map((item) => (
                                                <Link
                                                    key={item.slug}
                                                    href={`/categories/${item.slug}`}
                                                    onClick={() => setOpenGroup(null)}
                                                    className={`block px-4 py-2 text-sm hover:bg-navy-50 hover:text-navy-800 ${
                                                        item.slug === activeCategorySlug
                                                            ? "font-semibold text-navy-800"
                                                            : "text-navy-600"
                                                    }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {footwear && (
                            <Link
                                href={`/categories/${footwear.slug}`}
                                className={navLinkClass(isFootwearActive)}
                            >
                                Footwear
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
