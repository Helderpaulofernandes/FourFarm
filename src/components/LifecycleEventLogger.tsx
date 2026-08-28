"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOfflineQueue } from "@/lib/offline-queue";
import { logLifecycleEvent } from "@/server/actions/growing-units";
import type { LifecycleEventInput } from "@/schemas/growing-unit";

const quickEventTypes = ["Watered", "Pest treatment", "Weeding", "Inspection", "Other"];

export function LifecycleEventLogger({
  occupancyId,
  growingUnitId,
}: {
  occupancyId: string;
  growingUnitId: string;
}) {
  const router = useRouter();
  const [eventType, setEventType] = useState(quickEventTypes[0]);
  const [notes, setNotes] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const { submit, pendingCount } = useOfflineQueue<LifecycleEventInput>(
    `lifecycle-events-${occupancyId}`,
    async (payload) => {
      await logLifecycleEvent(payload, growingUnitId);
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({ occupancyId, eventType, notes: notes || undefined });
    setNotes("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {quickEventTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setEventType(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              eventType === type ? "bg-green-700 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            {type}
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

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="h-12 flex-1 rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800"
        >
          Log event
        </button>
      </div>

      <div className="text-xs text-stone-500">
        {justSaved && pendingCount === 0 && "Saved."}
        {pendingCount > 0 && `${pendingCount} pending sync (saved locally)...`}
      </div>
    </form>
  );
}
