import Link from "next/link";
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
    Truck,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetAllProducts } from "@/lib/actions/product-action";
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

export default async function Home() {
    const [categoriesResult, productsResult] = await Promise.all([
        handleGetAllCategories(),
        handleGetAllProducts({ limit: 8 }),
    ]);

    const categories = categoriesResult.success ? categoriesResult.data.categories : [];
    const products = productsResult.success ? productsResult.data.products : [];

    return (
        <main>
            <section className="bg-navy-50">
                <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-gold-700">Trek season 2026</p>
                        <h1 className="mt-2 text-4xl font-bold leading-tight text-navy-800">
                            Gear up for the Himalaya
                        </h1>
                        <p className="mt-3 max-w-md text-navy-400">
                            All the layers, boots, and packs you need from basecamp to summit — trail tested in Nepal.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <Link
                                href="/products"
                                className="rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                            >
                                Shop now
                            </Link>
                            <Link
                                href="/products"
                                className="rounded-full border-2 border-navy-600 px-6 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-100"
                            >
                                See all gear
                            </Link>
                        </div>
                    </div>
                    <img
                        src="/hero.png"
                        alt="Trekking gear — backpack, hiking boots, jacket, and tent against Himalayan peaks"
                        className="hidden w-full md:block"
                    />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-12">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-navy-800">Shop by category</h2>
                        <p className="mt-1 text-sm text-navy-400">Everything you need for the high mountains, sorted.</p>
                    </div>
                    <Link
                        href="/products"
                        className="hidden rounded-full border-2 border-navy-600 px-4 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50 sm:block"
                    >
                        See all categories
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {categories.map((category: any) => {
                        const Icon = categoryIcons[category.slug] || Mountain;
                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="rounded-xl bg-navy-50 p-5 text-center transition-colors hover:bg-navy-100"
                            >
                                <Icon className="mx-auto h-6 w-6 text-navy-600" />
                                <p className="mt-2.5 text-sm font-medium text-navy-800">{category.name}</p>
                                <p className="mt-0.5 text-xs text-navy-400">{category.productCount} products</p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pb-12">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-navy-800">Our featured gear</h2>
                        <p className="mt-1 text-sm text-navy-400">Bucket-list ready equipment — grab it before the season starts.</p>
                    </div>
                    <Link
                        href="/products"
                        className="hidden rounded-full border-2 border-navy-600 px-4 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50 sm:block"
                    >
                        See all gear
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <section className="bg-navy-800">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center md:grid-cols-4">
                    <div>
                        <p className="text-2xl font-bold text-gold-400">30+</p>
                        <p className="mt-1 text-sm text-navy-200">Products in stock</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gold-400">10</p>
                        <p className="mt-1 text-sm text-navy-200">Gear categories</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gold-400">24/7</p>
                        <p className="mt-1 text-sm text-navy-200">Customer support</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gold-400">100%</p>
                        <p className="mt-1 text-sm text-navy-200">Secure checkout</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center md:grid-cols-4">
                <div>
                    <Truck className="mx-auto h-6 w-6 text-navy-600" />
                    <p className="mt-2 text-sm font-semibold text-navy-800">Free delivery</p>
                    <p className="mt-0.5 text-xs text-navy-400">On orders over NRs. 10,000</p>
                </div>
                <div>
                    <ShieldCheck className="mx-auto h-6 w-6 text-navy-600" />
                    <p className="mt-2 text-sm font-semibold text-navy-800">Secure payment</p>
                    <p className="mt-0.5 text-xs text-navy-400">Encrypted checkout</p>
                </div>
                <div>
                    <RefreshCw className="mx-auto h-6 w-6 text-navy-600" />
                    <p className="mt-2 text-sm font-semibold text-navy-800">Easy returns</p>
                    <p className="mt-0.5 text-xs text-navy-400">30-day return window</p>
                </div>
                <div>
                    <Mountain className="mx-auto h-6 w-6 text-navy-600" />
                    <p className="mt-2 text-sm font-semibold text-navy-800">Trail tested</p>
                    <p className="mt-0.5 text-xs text-navy-400">Gear proven in Nepal</p>
                </div>
            </section>
        </main>
    );
}
