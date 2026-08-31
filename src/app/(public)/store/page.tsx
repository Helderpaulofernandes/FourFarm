import Link from "next/link";
import { listPublicProducts } from "@/server/actions/products";

export default async function StorePage() {
  const products = await listPublicProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Our Produce</h1>
      <p className="mt-1 text-stone-500">Grown here at Four Farm — tap a product to see how we grow it.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/store/${product.id}`}
            className="rounded-xl border border-stone-200 bg-white p-4 active:bg-stone-50"
          >
            <div className="font-medium text-stone-900">{product.name}</div>
            <div className="text-sm text-stone-500">
              {product.varietyBreed && `${product.varietyBreed.species.commonName} — ${product.varietyBreed.name}`}
            </div>
            <div className="mt-2 text-lg font-semibold text-stone-900">
              {product.price != null ? `R${product.price.toFixed(2)}` : "Price on enquiry"}{" "}
              <span className="text-sm font-normal text-stone-500">/ {product.saleUnit}</span>
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="text-stone-500">Nothing listed yet — check back soon.</p>}
      </div>
    </div>
  );
}
