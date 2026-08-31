"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemInput } from "@/schemas/inventory";
import { createItem, updateItem } from "@/server/actions/inventory";

type ExistingItem = ItemInput & { id: string };

export function ItemForm({ existing, onDone }: { existing?: ExistingItem; onDone?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(!!existing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({ resolver: zodResolver(itemSchema), defaultValues: existing ?? { itemType: "SEED" } });

  async function onSubmit(data: ItemInput) {
    if (existing) {
      await updateItem(existing.id, data);
    } else {
      await createItem(data);
      reset();
      setOpen(false);
    }
    onDone?.();
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 sm:w-auto sm:px-6">
        + Add item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Type</label>
          <select {...register("itemType")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="SEED">Seed</option>
            <option value="FEED">Feed</option>
            <option value="COMPOST">Compost</option>
            <option value="CONDITIONER">Conditioner</option>
            <option value="AMENDMENT">Amendment</option>
            <option value="PACKAGING">Packaging</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Code</label>
          <input {...register("code")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Default unit</label>
          <input {...register("defaultUnit")} placeholder="kg, seeds, L" className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60">
          {isSubmitting ? "Saving..." : existing ? "Save changes" : "Save item"}
        </button>
        <button
          type="button"
          onClick={() => (existing ? onDone?.() : setOpen(false))}
          className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
