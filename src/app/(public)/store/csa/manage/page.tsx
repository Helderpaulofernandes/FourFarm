"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billingPortalLookupSchema, type BillingPortalLookupInput } from "@/schemas/csa";
import { getBillingPortalUrl } from "@/server/actions/csa";

export default function ManageCSAPage() {
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillingPortalLookupInput>({ resolver: zodResolver(billingPortalLookupSchema) });

  async function onSubmit(data: BillingPortalLookupInput) {
    setNotFound(false);
    const url = await getBillingPortalUrl(data);
    if (!url) {
      setNotFound(true);
      return;
    }
    window.location.href = url;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Manage Your Subscription</h1>
      <p className="mt-1 text-stone-500">Enter the email you subscribed with — you&apos;ll be taken to a secure page to update or cancel.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
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
          {isSubmitting ? "Looking up..." : "Manage subscription"}
        </button>
      </form>

      {notFound && <p className="mt-4 text-sm text-red-600">No active subscription found for that email.</p>}
    </div>
  );
}
