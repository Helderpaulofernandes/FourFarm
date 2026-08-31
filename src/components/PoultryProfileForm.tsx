"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { poultryProfileSchema, type PoultryProfileInput } from "@/schemas/species";
import { createPoultryProfile } from "@/server/actions/species";

type VarietyOption = { id: string; name: string; species: { commonName: string } };
type MethodOption = { id: string; name: string };

export function PoultryProfileForm({ varieties, methods }: { varieties: VarietyOption[]; methods: MethodOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof poultryProfileSchema>, unknown, PoultryProfileInput>({
    resolver: zodResolver(poultryProfileSchema),
    defaultValues: {
      varietyBreedId: varieties[0]?.id,
      methodId: methods[0]?.id,
      flockType: "LAYER",
    },
  });

  async function onSubmit(data: PoultryProfileInput) {
    await createPoultryProfile(data);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (varieties.length === 0 || methods.length === 0) {
    return <p className="text-sm text-stone-500">Add a breed and a production method first.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg border border-green-700 text-base font-medium text-green-700 active:bg-green-50 sm:w-auto sm:px-6"
      >
        + Add poultry profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Breed</label>
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
        <div>
          <label className="text-sm font-medium text-stone-700">Flock type</label>
          <select {...register("flockType")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="LAYER">Layer</option>
            <option value="BROILER">Broiler</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Brooding days</label>
          <input type="number" {...register("broodingDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Grow-out days</label>
          <input type="number" {...register("growOutDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Target processing age (days)</label>
          <input type="number" {...register("targetProcessingAgeDays")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Expected feed / bird / day (kg)</label>
          <input type="number" step="0.01" {...register("expectedFeedConsumptionPerBirdDay")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Expected eggs / hen / week</label>
          <input type="number" step="0.1" {...register("expectedEggsPerHenWeek")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Expected live weight (kg)</label>
          <input type="number" step="0.1" {...register("expectedLiveWeightKg")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
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
