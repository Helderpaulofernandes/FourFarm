"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { productionAreaSchema, type ProductionAreaInput } from "@/schemas/production-area";
import { createProductionArea } from "@/server/actions/production-areas";

export function ProductionAreaForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof productionAreaSchema>, unknown, ProductionAreaInput>({
    resolver: zodResolver(productionAreaSchema),
    defaultValues: { areaType: "BED" },
  });

  async function onSubmit(data: ProductionAreaInput) {
    await createProductionArea(data);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 sm:w-auto sm:px-6"
      >
        + Add area
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Type</label>
          <select {...register("areaType")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="BED">Bed</option>
            <option value="NURSERY_BENCH">Nursery bench</option>
            <option value="TRACTOR">Tractor</option>
            <option value="FOREST_ROW">Forest row</option>
            <option value="COOP">Coop</option>
            <option value="PADDOCK">Paddock</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Code</label>
          <input {...register("code")} placeholder="MG-B01" className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Grid X</label>
          <input type="number" {...register("gridX")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Grid Y</label>
          <input type="number" {...register("gridY")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save area"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
