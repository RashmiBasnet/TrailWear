"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { handleGetAdminProducts, handleDeleteProduct } from "@/lib/actions/admin-action";

const LIMIT = 10;
const genderLabels: Record<string, string> = {
    MEN: "Men",
    WOMEN: "Women",
    UNISEX: "Unisex",
};

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState("");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const params: any = { page, limit: LIMIT };
        if (query) params.search = query;
        const result = await handleGetAdminProducts(params);
        if (result.success) {
            setProducts(result.data.products);
            setPagination(result.data.pagination);
        } else {
            setError(result.message || "Failed to load products.");
            setProducts([]);
        }
        setLoading(false);
    }, [page, query]);

    useEffect(() => {
        load();
    }, [load]);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setQuery(search.trim());
    };

    const onDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        const result = await handleDeleteProduct(id);
        setDeletingId("");
        if (result.success) {
            if (products.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                load();
            }
        } else {
            setError(result.message || "Failed to delete product.");
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">Products</h1>
                    <p className="mt-1 text-sm text-navy-400">{pagination.total} total</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-1.5 rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700"
                >
                    <Plus className="h-4 w-4" />
                    New product
                </Link>
            </div>

            <form onSubmit={onSearch} className="relative mb-4 max-w-sm">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full rounded-full border border-border bg-white py-2 pl-4 pr-10 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                />
                <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                    <Search className="h-4 w-4" />
                </button>
            </form>

            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy-300">
                            <th className="px-4 py-3 font-semibold">Product</th>
                            <th className="px-4 py-3 font-semibold">Category</th>
                            <th className="px-4 py-3 font-semibold">Gender</th>
                            <th className="px-4 py-3 font-semibold">Price</th>
                            <th className="px-4 py-3 font-semibold">Stock</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">Loading…</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                                                {product.images?.[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="font-medium text-navy-800">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-navy-600">{product.category?.name}</td>
                                    <td className="px-4 py-3 text-navy-600">{genderLabels[product.gender] || product.gender}</td>
                                    <td className="px-4 py-3 font-medium text-navy-800">
                                        NRs. {Number(product.price).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-navy-600">{product.stock}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                aria-label="Edit"
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-navy-600 hover:bg-navy-50"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => onDelete(product.id, product.name)}
                                                disabled={deletingId === product.id}
                                                aria-label="Delete"
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-danger hover:bg-danger/5 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-navy-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={page >= pagination.totalPages}
                            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
