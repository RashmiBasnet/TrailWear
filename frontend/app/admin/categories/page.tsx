"use client";

import { useEffect, useState } from "react";
import { handleCreateCategory } from "@/lib/actions/admin-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        const result = await handleGetAllCategories();
        if (result.success) {
            setCategories(result.data.categories);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const onNameChange = (value: string) => {
        setName(value);
        if (!slugEdited) setSlug(slugify(value));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim() || !slug.trim()) {
            setError("Name and slug are required.");
            return;
        }
        if (!SLUG_REGEX.test(slug)) {
            setError("Slug must be kebab-case (lowercase letters, numbers and single hyphens).");
            return;
        }

        const payload: any = { name: name.trim(), slug: slug.trim() };
        if (description.trim()) payload.description = description.trim();

        setSubmitting(true);
        const result = await handleCreateCategory(payload);
        setSubmitting(false);

        if (result.success) {
            setSuccess("Category created.");
            setName("");
            setSlug("");
            setSlugEdited(false);
            setDescription("");
            load();
        } else {
            setError(result.message || "Failed to create category.");
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">Categories</h1>
                <p className="mt-1 text-sm text-navy-400">{categories.length} total</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy-300">
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Slug</th>
                                <th className="px-4 py-3 font-semibold">Products</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-navy-400">Loading…</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-navy-400">No categories yet.</td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 font-medium text-navy-800">{category.name}</td>
                                        <td className="px-4 py-3 text-navy-600">{category.slug}</td>
                                        <td className="px-4 py-3 text-navy-600">{category.productCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-xl border border-border bg-white p-5">
                    <h2 className="mb-4 text-base font-semibold text-navy-800">New category</h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {error && (
                            <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
                                {success}
                            </p>
                        )}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy-800">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                placeholder="Sleeping bags"
                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy-800">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setSlugEdited(true);
                                }}
                                placeholder="sleeping-bags"
                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-navy-800">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Optional"
                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                        >
                            {submitting ? "Creating…" : "Create category"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
