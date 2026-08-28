"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { cropSchema, type CropInput } from "@/schemas/crop";
import { createCrop } from "@/server/actions/crops";

type ProtectionMethod = { id: string; name: string };

export function CropForm({ protectionMethods }: { protectionMethods: ProtectionMethod[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof cropSchema>, unknown, CropInput>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      propagationMethod: "TRANSPLANT",
      wetMultiplier: 1,
      dryMultiplier: 1,
      protectionMethodIds: [],
    },
  });

  async function onSubmit(data: CropInput) {
    setServerError(null);
    try {
      await createCrop(data);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 sm:w-auto sm:px-6"
      >
        + Add crop
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Variety</label>
          <input {...register("variety")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Propagation method</label>
          <select
            {...register("propagationMethod")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            <option value="DIRECT_SEED">Direct seed</option>
            <option value="TRANSPLANT">Transplant</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Spacing (cm)</label>
          <input
            type="number"
            {...register("spacingCm")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Days to maturity (min)</label>
          <input
            type="number"
            {...register("daysToMaturityMin")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Days to maturity (max)</label>
          <input
            type="number"
            {...register("daysToMaturityMax")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Wet season multiplier</label>
          <input
            type="number"
            step="0.05"
            {...register("wetMultiplier")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Dry season multiplier</label>
          <input
            type="number"
            step="0.05"
            {...register("dryMultiplier")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
      </div>

      {protectionMethods.length > 0 && (
        <div>
          <label className="text-sm font-medium text-stone-700">Protection methods</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {protectionMethods.map((pm) => (
              <label
                key={pm.id}
                className="flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm"
              >
                <input type="checkbox" value={pm.id} {...register("protectionMethodIds")} />
                {pm.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save crop"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
