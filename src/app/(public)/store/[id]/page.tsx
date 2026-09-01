import Link from "next/link";
import { getPublicProduct } from "@/server/actions/products";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPublicProduct(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/store" className="text-sm text-green-700 underline">
        ← Back to store
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-stone-900">{product.name}</h1>
      {product.varietyBreed && (
        <p className="text-stone-500">
          {product.varietyBreed.species.commonName} — {product.varietyBreed.name}
        </p>
      )}

      <div className="mt-4 text-2xl font-semibold text-stone-900">
        {product.price != null ? formatMoney(product.price) : "Price on enquiry"}{" "}
        <span className="text-base font-normal text-stone-500">
          / {product.saleUnit}
          {product.standardPackSize ? ` (${product.standardPackSize})` : ""}
        </span>
      </div>

      {product.price != null && (
        <AddToCartButton productId={product.id} name={product.name} price={product.price} saleUnit={product.saleUnit} />
      )}

      {product.varietyBreed?.publicDescription && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-500">About this variety</h2>
          <p className="mt-1 text-stone-700">{product.varietyBreed.publicDescription}</p>
        </div>
      )}

      {product.profile?.method?.publicDescription && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-500">How we grow it — {product.profile.method.name}</h2>
          <p className="mt-1 text-stone-700">{product.profile.method.publicDescription}</p>
        </div>
      )}
    </div>
  );
}
