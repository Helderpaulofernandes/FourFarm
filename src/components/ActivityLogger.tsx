"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOfflineQueue } from "@/lib/offline-queue";
import { logActivity } from "@/server/actions/production-batches";
import type { LogActivityInput } from "@/schemas/production-batch";

// Deliberately excludes routine daily care (watering, etc.) — logging something
// that happens every day the same way is noise, not signal. Only notable,
// variable events belong here.
const quickActivityTypes: { type: LogActivityInput["activityType"]; label: string }[] = [
  { type: "PEST_TREATMENT", label: "Pest treatment" },
  { type: "WEED", label: "Weeding" },
  { type: "PRUNE", label: "Pruning" },
  { type: "OBSERVATION", label: "Inspection" },
  { type: "OTHER", label: "Other" },
];

export function ActivityLogger({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [activityType, setActivityType] = useState<LogActivityInput["activityType"]>("WATER");
  const [notes, setNotes] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const { submit, pendingCount } = useOfflineQueue<LogActivityInput>(`activities-${batchId}`, async (payload) => {
    await logActivity(payload);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({ batchId, activityType, notes: notes || undefined });
    setNotes("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {quickActivityTypes.map((qt) => (
          <button
            key={qt.type}
            type="button"
            onClick={() => setActivityType(qt.type)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activityType === qt.type ? "bg-green-700 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            {qt.label}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full rounded-lg border border-stone-300 p-3 text-base"
      />
      <button type="submit" className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800">
        Log activity
      </button>
      <div className="text-xs text-stone-500">
        {justSaved && pendingCount === 0 && "Saved."}
        {pendingCount > 0 && `${pendingCount} pending sync (saved locally)...`}
      </div>
    </form>
  );
}
