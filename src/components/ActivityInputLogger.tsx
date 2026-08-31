"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOfflineQueue } from "@/lib/offline-queue";
import { logActivityInput } from "@/server/actions/inventory";
import type { LogActivityInputInput } from "@/schemas/inventory";

type Lot = { id: string; lotCode: string; unit: string; quantityRemaining: number; item: { name: string } };

export function ActivityInputLogger({ batchId, lots }: { batchId: string; lots: Lot[] }) {
  const router = useRouter();
  const [inventoryLotId, setInventoryLotId] = useState(lots[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");

  const { submit, pendingCount } = useOfflineQueue<LogActivityInputInput>(`activity-inputs-${batchId}`, async (payload) => {
    await logActivityInput(payload);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inventoryLotId || !quantity) return;
    await submit({ batchId, inventoryLotId, quantity: Number(quantity) });
    setQuantity("");
    router.refresh();
  }

  if (lots.length === 0) {
    return <p className="text-sm text-stone-500">Add inventory lots first to log inputs here.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <select value={inventoryLotId} onChange={(e) => setInventoryLotId(e.target.value)} className="h-11 rounded-lg border border-stone-300 px-3">
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.item.name} ({l.lotCode}) — {l.quantityRemaining}
              {l.unit} left
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          className="h-11 rounded-lg border border-stone-300 px-3"
        />
      </div>
      <button type="submit" className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800">
        Log input
      </button>
      {pendingCount > 0 && <div className="text-xs text-stone-500">{pendingCount} pending sync (saved locally)...</div>}
    </form>
  );
}
