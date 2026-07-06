"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const categoryLinks = [
    { name: "Base layers", slug: "base-layers" },
    { name: "Jackets", slug: "jackets" },
    { name: "Footwear", slug: "shoes" },
    { name: "Backpacks", slug: "backpacks" },
    { name: "Tents", slug: "tents" },
    { name: "Equipment", slug: "equipment" },
];

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const [search, setSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search.trim())}`);
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
                    <Link href="/wishlist" aria-label="Wishlist" className="hover:text-navy-800">
                        <Heart className="h-5 w-5" />
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
                                <button onClick={logout} aria-label="Logout" className="text-navy-400 hover:text-navy-800">
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
                    <nav className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-2.5 text-sm font-medium text-white">
                        <Link href="/products" className="whitespace-nowrap hover:text-gold-300">All gear</Link>
                        {categoryLinks.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/products?category=${cat.slug}`}
                                className="whitespace-nowrap text-navy-100 hover:text-gold-300"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
