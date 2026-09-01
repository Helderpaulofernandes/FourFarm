"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createBookingSchema, type CreateBookingInput } from "@/schemas/booking";
import { createBooking } from "@/server/actions/bookings";

export default function PickYourOwnPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createBookingSchema>, unknown, CreateBookingInput>({ resolver: zodResolver(createBookingSchema) });

  async function onSubmit(data: CreateBookingInput) {
    setError(null);
    try {
      await createBooking(data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900">Request received</h1>
        <p className="mt-2 text-stone-600">We&apos;ll confirm your pick-your-own booking by email shortly.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Book a Pick-Your-Own Visit</h1>
      <p className="mt-1 text-stone-500">Send us a request and we&apos;ll confirm your slot by email.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("customer.name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.customer?.name && <p className="text-sm text-red-600">{errors.customer.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Email</label>
          <input type="email" {...register("customer.email")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.customer?.email && <p className="text-sm text-red-600">{errors.customer.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Phone (optional)</label>
          <input {...register("customer.phone")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Preferred date</label>
          <input type="date" {...register("requestedDate")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.requestedDate && <p className="text-sm text-red-600">{errors.requestedDate.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Party size</label>
          <input type="number" {...register("partySize")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.partySize && <p className="text-sm text-red-600">{errors.partySize.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Note (optional)</label>
          <textarea {...register("customer.note")} rows={2} className="mt-1 w-full rounded-lg border border-stone-300 p-3" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Request booking"}
        </button>
      </form>
    </div>
  );
}
