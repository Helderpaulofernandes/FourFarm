"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { treeProfileSchema, type TreeProfileInput } from "@/schemas/species";
import { createTreeProfile } from "@/server/actions/species";

type VarietyOption = { id: string; name: string; species: { commonName: string } };
type MethodOption = { id: string; name: string };

export function TreeProfileForm({ varieties, methods }: { varieties: VarietyOption[]; methods: MethodOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof treeProfileSchema>, unknown, TreeProfileInput>({
    resolver: zodResolver(treeProfileSchema),
    defaultValues: {
      varietyBreedId: varieties[0]?.id,
      methodId: methods[0]?.id,
      canopyStratum: "LOW",
      successionalStage: "SECONDARY",
      nitrogenFixer: false,
      chopAndDropCandidate: false,
    },
  });

  async function onSubmit(data: TreeProfileInput) {
    await createTreeProfile(data);
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
        + Add tree profile
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
        <div>
          <label className="text-sm font-medium text-stone-700">Canopy stratum</label>
          <select {...register("canopyStratum")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="EMERGENT">Emergent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="SHRUB">Shrub</option>
            <option value="GROUND_COVER">Ground cover</option>
            <option value="CLIMBER">Climber</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Successional stage</label>
          <select {...register("successionalStage")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="PLACENTA">Placenta (pioneer)</option>
            <option value="SECONDARY">Secondary</option>
            <option value="CLIMAX">Climax</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Mature height (m)</label>
          <input type="number" step="0.1" {...register("matureHeightM")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Mature spread (m)</label>
          <input type="number" step="0.1" {...register("matureSpreadM")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Within-row spacing (m)</label>
          <input type="number" step="0.1" {...register("withinRowSpacingM")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Between-row spacing (m)</label>
          <input type="number" step="0.1" {...register("betweenRowSpacingM")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Years to first yield</label>
          <input type="number" step="0.1" {...register("yearsToFirstYield")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Pruning frequency (months)</label>
          <input type="number" {...register("pruningFrequencyMonths")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" {...register("nitrogenFixer")} /> Nitrogen fixer
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" {...register("chopAndDropCandidate")} /> Chop-and-drop candidate
        </label>
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
