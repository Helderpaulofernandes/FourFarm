"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { cropProfileSchema, type CropProfileInput } from "@/schemas/species";
import { createCropProfile } from "@/server/actions/species";

type VarietyOption = { id: string; name: string; species: { commonName: string } };
type MethodOption = { id: string; name: string };

export function CropProfileForm({ varieties, methods }: { varieties: VarietyOption[]; methods: MethodOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof cropProfileSchema>, unknown, CropProfileInput>({
    resolver: zodResolver(cropProfileSchema),
    defaultValues: {
      varietyBreedId: varieties[0]?.id,
      methodId: methods[0]?.id,
      nurseryRequired: true,
    },
  });

  async function onSubmit(data: CropProfileInput) {
    await createCropProfile(data);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (varieties.length === 0 || methods.length === 0) {
    return <p className="text-sm text-stone-500">Add a variety and a production method first.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg border border-green-700 text-base font-medium text-green-700 active:bg-green-50 sm:w-auto sm:px-6"
      >
        + Add production profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Variety</label>
          <select {...register("varietyBreedId")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.species.commonName} — {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Method</label>
          <select {...register("methodId")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-stone-700">Profile name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" {...register("nurseryRequired")} /> Nursery required before transplanting
        </label>
        <div>
          <label className="text-sm font-medium text-stone-700">Days in nursery</label>
          <input type="number" {...register("targetNurseryDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Days to germination</label>
          <input type="number" {...register("daysToGerminationTypical")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Hardening days</label>
          <input type="number" {...register("hardeningDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Days to first harvest</label>
          <input type="number" {...register("targetHarvestStartDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.targetHarvestStartDays && <p className="text-sm text-red-600">{errors.targetHarvestStartDays.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Harvest window (days)</label>
          <input type="number" {...register("targetHarvestWindowDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Plant spacing (mm)</label>
          <input type="number" {...register("plantSpacingMm")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.plantSpacingMm && <p className="text-sm text-red-600">{errors.plantSpacingMm.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Row spacing (mm)</label>
          <input type="number" {...register("rowSpacingMm")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.rowSpacingMm && <p className="text-sm text-red-600">{errors.rowSpacingMm.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
