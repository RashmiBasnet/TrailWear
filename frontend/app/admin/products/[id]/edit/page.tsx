"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminProductForm from "@/app/_components/AdminProductForm";
import { handleGetProductById } from "@/lib/actions/product-action";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const result = await handleGetProductById(id);
            if (result.success) {
                setProduct(result.data.product);
            } else {
                setError(result.message || "Failed to load product.");
            }
            setLoading(false);
        };
        load();
    }, [id]);

    return (
        <div>
            <Link
                href="/admin/products"
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to products
            </Link>
            <h1 className="mb-6 text-2xl font-bold text-navy-800">Edit product</h1>

            {loading ? (
                <p className="text-sm text-navy-400">Loading…</p>
            ) : error ? (
                <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            ) : (
                <AdminProductForm product={product} />
            )}
        </div>
    );
}
