"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const { lines, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Your Cart</h1>

      {lines.length === 0 ? (
        <p className="mt-6 text-stone-500">
          Your cart is empty.{" "}
          <Link href="/store" className="text-green-700 underline">
            Browse the store
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {lines.map((line) => (
              <div key={line.productId} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
                <div>
                  <div className="font-medium text-stone-900">{line.name}</div>
                  <div className="text-sm text-stone-500">
                    {formatMoney(line.price)} / {line.saleUnit}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-stone-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                      className="h-9 w-9 text-stone-600"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                      className="h-9 w-9 text-stone-600"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(line.productId)} className="text-xs font-medium text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="text-lg font-medium text-stone-700">Subtotal</span>
            <span className="text-xl font-semibold text-stone-900">{formatMoney(subtotal)}</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/store/checkout")}
            className="mt-6 h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800"
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
}
