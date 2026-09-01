import { getPublicProduct } from "@/server/actions/products";
import { SubscribeForm } from "@/components/SubscribeForm";
import { formatMoney } from "@/lib/format";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; frequency?: string }>;
}) {
  const { product: productId, frequency } = await searchParams;
  if (!productId) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-stone-500">No product selected.</div>;
  }
  const product = await getPublicProduct(productId);
  const freq = frequency === "FORTNIGHTLY" ? "FORTNIGHTLY" : "WEEKLY";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Subscribe to {product.name}</h1>
      <p className="mt-1 text-stone-500">
        {formatMoney(product.price ?? 0)} every {freq === "FORTNIGHTLY" ? "fortnight" : "week"}, billed automatically via Stripe. Cancel any
        time from the manage-subscription page.
      </p>

      <SubscribeForm productId={product.id} frequency={freq} />
    </div>
  );
}
