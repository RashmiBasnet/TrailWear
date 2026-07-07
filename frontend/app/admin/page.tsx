"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Tags, Users, Plus } from "lucide-react";
import { handleGetAdminProducts, handleGetAllUsers } from "@/lib/actions/admin-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, categories: 0, users: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [productsResult, categoriesResult, usersResult] = await Promise.all([
                handleGetAdminProducts({ limit: 1 }),
                handleGetAllCategories(),
                handleGetAllUsers(),
            ]);
            setStats({
                products: productsResult.success ? productsResult.data.pagination.total : 0,
                categories: categoriesResult.success ? categoriesResult.data.categories.length : 0,
                users: usersResult.success ? usersResult.data.users.length : 0,
            });
            setLoading(false);
        };
        load();
    }, []);

    const cards = [
        { label: "Products", value: stats.products, href: "/admin/products", icon: Package },
        { label: "Categories", value: stats.categories, href: "/admin/categories", icon: Tags },
        { label: "Users", value: stats.users, href: "/admin/users", icon: Users },
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy-800">Dashboard</h1>
                    <p className="mt-1 text-sm text-navy-400">Overview of your store.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-1.5 rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700"
                >
                    <Plus className="h-4 w-4" />
                    New product
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="text-3xl font-bold text-navy-800">
                                    {loading ? "—" : card.value}
                                </span>
                            </div>
                            <p className="mt-3 text-sm font-medium text-navy-600">{card.label}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
