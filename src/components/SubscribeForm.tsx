"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutCustomerSchema, type CheckoutCustomerInput } from "@/schemas/order";
import { createCSASubscriptionCheckout } from "@/server/actions/csa";

export function SubscribeForm({ productId, frequency }: { productId: string; frequency: "WEEKLY" | "FORTNIGHTLY" }) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutCustomerInput>({ resolver: zodResolver(checkoutCustomerSchema) });

  async function onSubmit(customer: CheckoutCustomerInput) {
    setError(null);
    try {
      const url = await createCSASubscriptionCheckout({ productId, frequency, customer });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting to payment..." : "Continue to payment"}
      </button>
    </form>
  );
}
