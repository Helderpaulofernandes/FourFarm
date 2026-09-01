"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

export function AddToCartButton({ productId, name, price, saleUnit }: { productId: string; name: string; price: number; saleUnit: string }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, name, price, saleUnit }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-stone-300">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-11 w-11 text-lg text-stone-600"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-base font-medium">{quantity}</span>
        <button type="button" onClick={() => setQuantity((q) => q + 1)} className="h-11 w-11 text-lg text-stone-600" aria-label="Increase quantity">
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="h-11 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800"
      >
        {added ? "Added" : "Add to cart"}
      </button>
    </div>
  );
}
