"use client";

import { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { formatMoney } from "@/lib/format";

type Profile = { id: string; name: string };
type Variety = { id: string; name: string; species: { commonName: string }; profiles: Profile[] };
type Product = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  saleUnit: string;
  standardPackSize: string | null;
  price: number | null;
  stockOnHand: number | null;
  varietyBreedId: string | null;
  profileId: string | null;
  publicVisible: boolean;
  isSubscription: boolean;
  varietyBreed: { name: string; species: { commonName: string } } | null;
};

export function ProductRow({ product, varieties }: { product: Product; varieties: Variety[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProductForm
        varieties={varieties}
        existing={{
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category ?? undefined,
          saleUnit: product.saleUnit,
          standardPackSize: product.standardPackSize ?? undefined,
          price: product.price ?? undefined,
          stockOnHand: product.stockOnHand ?? undefined,
          varietyBreedId: product.varietyBreedId ?? undefined,
          profileId: product.profileId ?? undefined,
          publicVisible: product.publicVisible,
          isSubscription: product.isSubscription,
        }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
      <div>
        <div className="font-medium text-stone-900">{product.name}</div>
        <div className="text-sm text-stone-500">
          {product.sku} · {product.price != null ? formatMoney(product.price) : "no price"} / {product.saleUnit}
          {product.stockOnHand != null && ` · ${product.stockOnHand} in stock`}
          {product.varietyBreed && ` · ${product.varietyBreed.species.commonName} — ${product.varietyBreed.name}`}
          {product.publicVisible && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">public</span>}
          {product.isSubscription && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">CSA</span>}
        </div>
      </div>
      <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700">
        Edit
      </button>
    </div>
  );
}
