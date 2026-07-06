"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminProductForm from "@/app/_components/AdminProductForm";

export default function NewProduct() {
    return (
        <div>
            <Link
                href="/admin/products"
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to products
            </Link>
            <h1 className="mb-6 text-2xl font-bold text-navy-800">New product</h1>
            <AdminProductForm />
        </div>
    );
}
