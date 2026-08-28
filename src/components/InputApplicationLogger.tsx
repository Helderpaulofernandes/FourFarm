"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOfflineQueue } from "@/lib/offline-queue";
import { logInputApplication } from "@/server/actions/inputs";
import type { InputApplicationInput } from "@/schemas/input";

type InputMaterial = { id: string; name: string; unit: string };

export function InputApplicationLogger({
  occupancyId,
  growingUnitId,
  materials,
}: {
  occupancyId: string;
  growingUnitId: string;
  materials: InputMaterial[];
}) {
  const router = useRouter();
  const [inputMaterialId, setInputMaterialId] = useState(materials[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");

  const { submit, pendingCount } = useOfflineQueue<InputApplicationInput>(
    `input-applications-${occupancyId}`,
    async (payload) => {
      await logInputApplication(payload, growingUnitId);
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMaterialId || !quantity) return;
    await submit({ occupancyId, inputMaterialId, quantity: Number(quantity) });
    setQuantity("");
    router.refresh();
  }

  if (materials.length === 0) {
    return <p className="text-sm text-stone-500">Add input materials first to log applications here.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={inputMaterialId}
          onChange={(e) => setInputMaterialId(e.target.value)}
          className="h-11 rounded-lg border border-stone-300 px-3"
        >
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.unit})
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
      <button
        type="submit"
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800"
      >
        Log application
      </button>
      {pendingCount > 0 && (
        <div className="text-xs text-stone-500">{pendingCount} pending sync (saved locally)...</div>
      )}
    </form>
  );
}
