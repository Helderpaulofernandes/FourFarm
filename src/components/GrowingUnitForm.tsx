"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { growingUnitSchema, type GrowingUnitInput } from "@/schemas/growing-unit";
import { createGrowingUnit } from "@/server/actions/growing-units";

export function GrowingUnitForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof growingUnitSchema>, unknown, GrowingUnitInput>({
    resolver: zodResolver(growingUnitSchema),
    defaultValues: { unitType: "BED" },
  });

  const unitType = watch("unitType");

  async function onSubmit(data: GrowingUnitInput) {
    await createGrowingUnit(data);
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
        + Add bed / tractor
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Type</label>
          <select {...register("unitType")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="BED">Bed</option>
            <option value="TRACTOR">Tractor</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Label</label>
          <input {...register("label")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.label && <p className="text-sm text-red-600">{errors.label.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Grid X</label>
          <input
            type="number"
            {...register("gridX")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Grid Y</label>
          <input
            type="number"
            {...register("gridY")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>

        {unitType === "BED" ? (
          <>
            <div>
              <label className="text-sm font-medium text-stone-700">Length (m)</label>
              <input
                type="number"
                step="0.1"
                {...register("lengthM")}
                className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Width (m)</label>
              <input
                type="number"
                step="0.1"
                {...register("widthM")}
                className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium text-stone-700">Bird capacity</label>
            <input
              type="number"
              {...register("capacity")}
              className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
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
