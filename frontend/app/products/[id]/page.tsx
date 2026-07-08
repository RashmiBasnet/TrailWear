import { notFound } from "next/navigation";
import { handleGetProductById } from "@/lib/actions/product-action";
import ProductDetails from "@/app/_components/ProductDetails";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await handleGetProductById(id);

    if (!result.success) {
        notFound();
    }

    return <ProductDetails product={result.data.product} />;
}
