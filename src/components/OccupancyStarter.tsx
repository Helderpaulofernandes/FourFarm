"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startOccupancy } from "@/server/actions/growing-units";

type Crop = { id: string; name: string; variety: string | null };

export function OccupancyStarter({
  growingUnitId,
  unitType,
  crops,
}: {
  growingUnitId: string;
  unitType: "BED" | "TRACTOR";
  crops: Crop[];
}) {
  const router = useRouter();
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await startOccupancy({
        growingUnitId,
        occupantType: unitType === "BED" ? "CROP_PLANTING" : "BIRD_BATCH",
        cropId: unitType === "BED" ? cropId : undefined,
        startedAt: new Date(),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="font-medium text-stone-900">Start a new occupancy</h3>
      {unitType === "BED" ? (
        crops.length > 0 ? (
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className="h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
                {crop.variety ? ` — ${crop.variety}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-stone-500">Add a crop first.</p>
        )
      ) : (
        <p className="text-sm text-stone-500">
          Starts a bird batch on this tractor. Detailed batch info arrives in Phase 2.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || (unitType === "BED" && crops.length === 0)}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Starting..." : "Start"}
      </button>
    </form>
  );
}
