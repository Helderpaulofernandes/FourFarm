"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { inputMaterialSchema, type InputMaterialInput } from "@/schemas/input";
import { createInputMaterial } from "@/server/actions/inputs";

export function InputMaterialForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof inputMaterialSchema>, unknown, InputMaterialInput>({
    resolver: zodResolver(inputMaterialSchema),
    defaultValues: { category: "COMPOST" },
  });

  async function onSubmit(data: InputMaterialInput) {
    await createInputMaterial(data);
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
        + Add input material
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
          <label className="text-sm font-medium text-stone-700">Category</label>
          <select {...register("category")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="COMPOST">Compost</option>
            <option value="CONDITIONER">Conditioner</option>
            <option value="AMENDMENT">Amendment</option>
            <option value="FEED">Feed</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Unit</label>
          <input
            {...register("unit")}
            placeholder="kg, L, bag"
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Cost per unit</label>
          <input
            type="number"
            step="0.01"
            {...register("costPerUnit")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save input"}
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
