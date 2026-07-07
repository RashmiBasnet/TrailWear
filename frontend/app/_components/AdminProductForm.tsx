"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { handleCreateProduct, handleUpdateProduct } from "@/lib/actions/admin-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { useToast } from "@/context/ToastContext";

const genderOptions = [
    { value: "UNISEX", label: "Unisex" },
    { value: "MEN", label: "Men" },
    { value: "WOMEN", label: "Women" },
];

export default function AdminProductForm({ product }: { product?: any }) {
    const router = useRouter();
    const toast = useToast();
    const isEdit = Boolean(product);

    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState(product?.name || "");
    const [description, setDescription] = useState(product?.description || "");
    const [price, setPrice] = useState(product ? String(product.price) : "");
    const [stock, setStock] = useState(product ? String(product.stock) : "0");
    const [categoryId, setCategoryId] = useState(product?.categoryId || "");
    const [gender, setGender] = useState(product?.gender || "UNISEX");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const result = await handleGetAllCategories();
            if (result.success) {
                setCategories(result.data.categories);
            }
        };
        load();
    }, []);

    const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files).slice(0, 5));
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !description.trim() || !price || !categoryId) {
            setError("Please fill in name, description, price and category.");
            toast.error("Missing product details", "Please fill in name, description, price and category.");
            return;
        }
        if (!isEdit && files.length === 0) {
            setError("Please add at least one product image.");
            toast.error("Product image required", "Please add at least one product image.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("price", price);
        formData.append("stock", stock || "0");
        formData.append("gender", gender);
        formData.append("categoryId", categoryId);
        files.forEach((file) => formData.append("images", file));

        setSubmitting(true);
        const result = isEdit
            ? await handleUpdateProduct(product.id, formData)
            : await handleCreateProduct(formData);
        setSubmitting(false);

        if (result.success) {
            toast.success(
                isEdit ? "Product updated" : "Product created",
                `${name.trim()} has been saved.`
            );
            router.replace("/admin/products");
        } else {
            const message = result.message || "Something went wrong.";
            setError(message);
            toast.error("Could not save product", message);
        }
    };

    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
            {error && (
                <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            )}

            <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Summit down jacket"
                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                />
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="800-fill down, weatherproof shell, packs to 1L…"
                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800">Price (NRs.)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="199.00"
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800">Stock</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 focus:border-navy-400 focus:outline-none"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800">Gender</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 focus:border-navy-400 focus:outline-none"
                    >
                        {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">
                    Images {isEdit && <span className="text-navy-400">(upload to replace existing)</span>}
                </label>

                {isEdit && product?.images?.length > 0 && files.length === 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {product.images.map((src: string, i: number) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Current ${i + 1}`}
                                className="h-20 w-20 rounded-lg border border-border object-cover"
                            />
                        ))}
                    </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 bg-navy-50 px-4 py-6 text-sm text-navy-600 hover:bg-navy-100">
                    <Upload className="h-4 w-4" />
                    <span>Choose images (up to 5, max 5MB each)</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFilesChange}
                        className="hidden"
                    />
                </label>

                {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-20 w-20 rounded-lg border border-border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    aria-label="Remove image"
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-900"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                >
                    {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="rounded-full border-2 border-navy-600 px-6 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
