"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/server/actions/products";
import type { ProductInput } from "@/schemas/product";

type Profile = { id: string; name: string };
type Variety = { id: string; name: string; species: { commonName: string }; profiles: Profile[] };
type ExistingProduct = ProductInput & { id: string };

export function ProductForm({
  varieties,
  existing,
  onDone,
}: {
  varieties: Variety[];
  existing?: ExistingProduct;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!!existing);
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [saleUnit, setSaleUnit] = useState(existing?.saleUnit ?? "");
  const [standardPackSize, setStandardPackSize] = useState(existing?.standardPackSize ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [stockOnHand, setStockOnHand] = useState(existing?.stockOnHand?.toString() ?? "");
  const [varietyBreedId, setVarietyBreedId] = useState(existing?.varietyBreedId ?? "");
  const [profileId, setProfileId] = useState(existing?.profileId ?? "");
  const [publicVisible, setPublicVisible] = useState(existing?.publicVisible ?? false);
  const [isSubscription, setIsSubscription] = useState(existing?.isSubscription ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedVariety = varieties.find((v) => v.id === varietyBreedId);
  const profiles = useMemo(() => selectedVariety?.profiles ?? [], [selectedVariety]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data: ProductInput = {
        sku,
        name,
        category: category || undefined,
        saleUnit,
        standardPackSize: standardPackSize || undefined,
        price: price ? Number(price) : undefined,
        stockOnHand: stockOnHand ? Number(stockOnHand) : undefined,
        varietyBreedId: varietyBreedId || undefined,
        profileId: profileId || undefined,
        publicVisible,
        isSubscription,
      };
      if (existing) {
        await updateProduct(existing.id, data);
      } else {
        await createProduct(data);
        setSku("");
        setName("");
        setCategory("");
        setSaleUnit("");
        setStandardPackSize("");
        setPrice("");
        setStockOnHand("");
        setVarietyBreedId("");
        setProfileId("");
        setPublicVisible(false);
        setIsSubscription(false);
        setOpen(false);
      }
      onDone?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 sm:w-auto sm:px-6"
      >
        + Add product
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Variety / breed</label>
          <select
            value={varietyBreedId}
            onChange={(e) => {
              setVarietyBreedId(e.target.value);
              setProfileId("");
            }}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            <option value="">—</option>
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.species.commonName} — {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Growing method</label>
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" disabled={profiles.length === 0}>
            <option value="">—</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Sale unit</label>
          <input value={saleUnit} onChange={(e) => setSaleUnit(e.target.value)} placeholder="bunch, kg, dozen" className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Standard pack size</label>
          <input value={standardPackSize} onChange={(e) => setStandardPackSize(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Price</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Stock on hand (optional)</label>
          <input
            type="number"
            value={stockOnHand}
            onChange={(e) => setStockOnHand(e.target.value)}
            placeholder="Leave blank for unlimited"
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={publicVisible} onChange={(e) => setPublicVisible(e.target.checked)} /> Visible in public store
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={isSubscription} onChange={(e) => setIsSubscription(e.target.checked)} /> Available as a CSA subscription (weekly/fortnightly box)
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Saving..." : existing ? "Save changes" : "Save product"}
        </button>
        <button
          type="button"
          onClick={() => (existing ? onDone?.() : setOpen(false))}
          className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
