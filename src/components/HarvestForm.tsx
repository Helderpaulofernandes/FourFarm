"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logHarvest } from "@/server/actions/production-batches";

export function HarvestForm({ batchId, defaultUnit }: { batchId: string; defaultUnit: string }) {
  const router = useRouter();
  const [grossQuantity, setGrossQuantity] = useState("");
  const [unit, setUnit] = useState(defaultUnit);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!grossQuantity) return;
    setSubmitting(true);
    await logHarvest({ batchId, grossQuantity: Number(grossQuantity), unit });
    setGrossQuantity("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="0.01"
          value={grossQuantity}
          onChange={(e) => setGrossQuantity(e.target.value)}
          placeholder="Quantity harvested"
          className="h-11 rounded-lg border border-stone-300 px-3"
        />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} className="h-11 rounded-lg border border-stone-300 px-3" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Log harvest"}
      </button>
    </form>
  );
}
