import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Shirt,
    Footprints,
    Backpack,
    Tent,
    Layers,
    Compass,
    Moon,
    Watch,
    Mountain,
    ArrowLeft,
} from "lucide-react";
import { handleGetCategoryBySlug } from "@/lib/actions/category-action";
import ProductCard from "@/app/_components/ProductCard";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, any> = {
    "base-layers": Layers,
    "outer-layers": Shirt,
    jackets: Shirt,
    shoes: Footprints,
    pants: Shirt,
    backpacks: Backpack,
    "sleeping-bags": Moon,
    tents: Tent,
    accessories: Watch,
    equipment: Compass,
};

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const result = await handleGetCategoryBySlug(slug);

    if (!result.success) {
        notFound();
    }

    const category = result.data.category;
    const Icon = categoryIcons[category.slug] || Mountain;

    return (
        <main>
            <section className="bg-navy-50">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                    <div className="flex items-center gap-5">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Icon className="h-7 w-7 text-navy-600" />
                            )}
                        </span>
                        <div>
                            <h1 className="text-3xl font-bold text-navy-800">{category.name}</h1>
                            <p className="mt-1 text-sm text-navy-400">
                                {category.products.length} product{category.products.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                    {category.description && (
                        <p className="mt-4 max-w-2xl text-navy-600">{category.description}</p>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10">
                {category.products.length === 0 ? (
                    <p className="rounded-xl border border-border bg-white px-4 py-10 text-center text-navy-400">
                        No products in this category yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {category.products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
