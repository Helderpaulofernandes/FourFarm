"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderLookupSchema, type OrderLookupInput } from "@/schemas/order";
import { getOrderForLookup } from "@/server/actions/orders";
import { formatMoney } from "@/lib/format";

type LookupResult = Awaited<ReturnType<typeof getOrderForLookup>>;

export default function OrderLookupPage() {
  const [result, setResult] = useState<LookupResult>(null);
  const [searched, setSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderLookupInput>({ resolver: zodResolver(orderLookupSchema) });

  async function onSubmit(data: OrderLookupInput) {
    const order = await getOrderForLookup(data);
    setResult(order);
    setSearched(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Look Up Your Order</h1>
      <p className="mt-1 text-stone-500">Enter your order number and the email you used at checkout.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Order ID</label>
          <input {...register("orderId")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.orderId && <p className="text-sm text-red-600">{errors.orderId.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Email</label>
          <input type="email" {...register("email")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Looking up..." : "Find order"}
        </button>
      </form>

      {searched && !result && <p className="mt-6 text-sm text-red-600">No matching order found for that ID and email.</p>}

      {result && (
        <div className="mt-6 space-y-1 rounded-xl border border-stone-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-stone-500">{result.status.toLowerCase()}</div>
          {result.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-stone-600">
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span>{formatMoney(item.lineTotal)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-medium text-stone-900">
            <span>Total</span>
            <span>{formatMoney(result.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
