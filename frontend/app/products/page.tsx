"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { handleGetAllProducts } from "@/lib/actions/product-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import ProductCard from "@/app/_components/ProductCard";

const LIMIT = 12;

const genderOptions = [
    { value: "", label: "All genders" },
    { value: "MEN", label: "Men" },
    { value: "WOMEN", label: "Women" },
    { value: "UNISEX", label: "Unisex" },
];

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const category = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page")) || 1;

    const [searchInput, setSearchInput] = useState(search);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        const load = async () => {
            const result = await handleGetAllCategories();
            if (result.success) setCategories(result.data.categories);
        };
        load();
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            const params: any = { page, limit: LIMIT };
            if (category) params.category = category;
            if (gender) params.gender = gender;
            if (search) params.search = search;
            const result = await handleGetAllProducts(params);
            if (result.success) {
                setProducts(result.data.products);
                setPagination(result.data.pagination);
            } else {
                setError(result.message || "Failed to load products.");
                setProducts([]);
            }
            setLoading(false);
        };
        load();
    }, [category, gender, search, page]);

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value) params.set(key, value);
                else params.delete(key);
            });
            if (!("page" in updates)) params.delete("page");
            router.push(`/products?${params.toString()}`);
        },
        [router, searchParams]
    );

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ search: searchInput.trim() || null });
    };

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">All gear</h1>
                <p className="mt-1 text-sm text-navy-400">{pagination.total} products</p>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={onSearchSubmit} className="relative max-w-sm flex-1">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search jackets, boots, tents…"
                        className="w-full rounded-full border border-border bg-white py-2 pl-4 pr-10 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                    />
                    <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                        <Search className="h-4 w-4" />
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="hidden h-4 w-4 text-navy-400 sm:block" />
                    <select
                        value={category}
                        onChange={(e) => updateParams({ category: e.target.value || null })}
                        className="rounded-full border border-border bg-white px-3.5 py-2 text-sm text-navy-800 focus:border-navy-400 focus:outline-none"
                    >
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={gender}
                        onChange={(e) => updateParams({ gender: e.target.value || null })}
                        className="rounded-full border border-border bg-white px-3.5 py-2 text-sm text-navy-800 focus:border-navy-400 focus:outline-none"
                    >
                        {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                </div>
            ) : products.length === 0 ? (
                <p className="rounded-xl border border-border bg-white px-4 py-16 text-center text-navy-400">
                    No products found.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-navy-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                            disabled={page <= 1}
                            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => updateParams({ page: String(Math.min(pagination.totalPages, page + 1)) })}
                            disabled={page >= pagination.totalPages}
                            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <main className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                </main>
            }
        >
            <ProductsContent />
        </Suspense>
    );
}
