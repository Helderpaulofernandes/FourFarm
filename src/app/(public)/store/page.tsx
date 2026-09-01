import Link from "next/link";
import { listPublicProducts } from "@/server/actions/products";
import { formatMoney } from "@/lib/format";

export default async function StorePage() {
  const products = await listPublicProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Our Produce</h1>
          <p className="mt-1 text-stone-500">Grown here at Four Farm — tap a product to see how we grow it.</p>
        </div>
        <div className="mt-1 flex flex-col items-end gap-1 whitespace-nowrap text-sm">
          <Link href="/store/order-lookup" className="text-green-700 underline">
            Track an order
          </Link>
          <Link href="/store/csa/manage" className="text-green-700 underline">
            Manage CSA subscription
          </Link>
          <Link href="/pick-your-own" className="text-green-700 underline">
            Pick your own
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/store/${product.id}`}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white active:bg-stone-50"
          >
            {product.primaryMediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.primaryMediaUrl} alt={product.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="h-40 w-full bg-stone-100" />
            )}
            <div className="p-4">
              <div className="font-medium text-stone-900">{product.name}</div>
              <div className="text-sm text-stone-500">
                {product.varietyBreed && `${product.varietyBreed.species.commonName} — ${product.varietyBreed.name}`}
              </div>
              <div className="mt-2 text-lg font-semibold text-stone-900">
                {product.price != null ? formatMoney(product.price) : "Price on enquiry"}{" "}
                <span className="text-sm font-normal text-stone-500">/ {product.saleUnit}</span>
              </div>
              {product.isSubscription && (
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">CSA subscription</span>
              )}
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="text-stone-500">Nothing listed yet — check back soon.</p>}
      </div>
    </div>
  );
}
