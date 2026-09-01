"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { checkoutCustomerSchema, type CheckoutCustomerInput } from "@/schemas/order";
import { createOrder, createCheckoutSession } from "@/server/actions/orders";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutCustomerInput>({
    resolver: zodResolver(checkoutCustomerSchema),
  });

  async function onSubmit(customer: CheckoutCustomerInput) {
    setError(null);
    try {
      const order = await createOrder({
        customer,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      const checkoutUrl = await createCheckoutSession(order.id);
      clear();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-stone-500">
          Your cart is empty.{" "}
          <Link href="/store" className="text-green-700 underline">
            Browse the store
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Checkout</h1>

      <div className="mt-4 space-y-1 rounded-xl border border-stone-200 bg-white p-4">
        {lines.map((line) => (
          <div key={line.productId} className="flex justify-between text-sm text-stone-600">
            <span>
              {line.quantity} × {line.name}
            </span>
            <span>{formatMoney(line.price * line.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-medium text-stone-900">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Email</label>
          <input type="email" {...register("email")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Phone (optional)</label>
          <input {...register("phone")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Note (optional)</label>
          <textarea {...register("note")} rows={2} className="mt-1 w-full rounded-lg border border-stone-300 p-3" placeholder="Pickup time, delivery instructions..." />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Redirecting to payment..." : `Pay ${formatMoney(subtotal)}`}
        </button>
      </form>
    </div>
  );
}
