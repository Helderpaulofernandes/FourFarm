"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { speciesSchema, type SpeciesInput } from "@/schemas/species";
import { createSpecies } from "@/server/actions/species";

export function SpeciesForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpeciesInput>({
    resolver: zodResolver(speciesSchema),
    defaultValues: { kingdom: "PLANT" },
  });

  async function onSubmit(data: SpeciesInput) {
    await createSpecies(data);
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
        + Add species
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Common name</label>
          <input {...register("commonName")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.commonName && <p className="text-sm text-red-600">{errors.commonName.message}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-stone-700">Kingdom</label>
          <select {...register("kingdom")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="PLANT">Plant</option>
            <option value="ANIMAL">Animal</option>
            <option value="FUNGI">Fungi</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Scientific name</label>
          <input {...register("scientificName")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Family</label>
          <input {...register("family")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save species"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
