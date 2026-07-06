"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (user.role !== "ADMIN") {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== "ADMIN") {
        return (
            <main className="flex flex-1 items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
            </main>
        );
    }

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
            <aside className="md:w-56 md:shrink-0">
                <div className="rounded-xl border border-border bg-white p-2">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-300">
                        Admin
                    </p>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                                        active
                                            ? "bg-navy-600 text-white"
                                            : "text-navy-600 hover:bg-navy-50"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
        </main>
    );
}
