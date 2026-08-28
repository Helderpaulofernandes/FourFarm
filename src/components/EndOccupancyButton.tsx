"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { endOccupancy } from "@/server/actions/growing-units";

export function EndOccupancyButton({
  occupancyId,
  growingUnitId,
}: {
  occupancyId: string;
  growingUnitId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (!confirm("End this occupancy? The unit will become available for a new planting/batch.")) return;
    setSubmitting(true);
    await endOccupancy(occupancyId, growingUnitId);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={submitting}
      className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-700 disabled:opacity-60"
    >
      {submitting ? "Ending..." : "End occupancy"}
    </button>
  );
}
