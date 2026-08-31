"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { inventoryLotSchema, type InventoryLotInput } from "@/schemas/inventory";
import { createInventoryLot } from "@/server/actions/inventory";

type ItemOption = { id: string; name: string; defaultUnit: string };

export function InventoryLotForm({ items }: { items: ItemOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof inventoryLotSchema>, unknown, InventoryLotInput>({
    resolver: zodResolver(inventoryLotSchema),
    defaultValues: { itemId: items[0]?.id, unit: items[0]?.defaultUnit },
  });

  async function onSubmit(data: InventoryLotInput) {
    await createInventoryLot(data);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (items.length === 0) return <p className="text-sm text-stone-500">Add an item first.</p>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-12 w-full rounded-lg border border-green-700 text-base font-medium text-green-700 active:bg-green-50 sm:w-auto sm:px-6">
        + Receive stock
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Item</label>
          <select {...register("itemId")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Lot code</label>
          <input {...register("lotCode")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.lotCode && <p className="text-sm text-red-600">{errors.lotCode.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Quantity received</label>
          <input type="number" {...register("quantityReceived")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.quantityReceived && <p className="text-sm text-red-600">{errors.quantityReceived.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Unit</label>
          <input {...register("unit")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Unit cost</label>
          <input type="number" step="0.01" {...register("unitCost")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60">
          {isSubmitting ? "Saving..." : "Save lot"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-lg border border-stone-300 px-4 text-base font-medium text-stone-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
