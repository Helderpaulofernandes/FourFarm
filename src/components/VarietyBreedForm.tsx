"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { varietyBreedSchema, type VarietyBreedInput } from "@/schemas/species";
import { createVarietyBreed } from "@/server/actions/species";

type SpeciesOption = { id: string; commonName: string };

export function VarietyBreedForm({ species }: { species: SpeciesOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VarietyBreedInput>({
    resolver: zodResolver(varietyBreedSchema),
    defaultValues: { speciesId: species[0]?.id },
  });

  async function onSubmit(data: VarietyBreedInput) {
    await createVarietyBreed(data);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (species.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-lg border border-green-700 text-base font-medium text-green-700 active:bg-green-50 sm:w-auto sm:px-6"
      >
        + Add variety
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Species</label>
          <select {...register("speciesId")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.commonName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Variety name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Rotation group</label>
          <select {...register("rotationGroup")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="">—</option>
            <option value="ROOT">Root</option>
            <option value="ALLIUM">Allium</option>
            <option value="FRUIT">Fruit</option>
            <option value="LEGUME">Legume</option>
            <option value="LEAF">Leaf</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save variety"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
