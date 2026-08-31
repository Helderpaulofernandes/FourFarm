"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeActivity, moveBatch } from "@/server/actions/production-batches";

type Activity = {
  id: string;
  activityType: string;
  status: string;
  plannedDateTime: Date | string | null;
  actualEndDateTime: Date | string | null;
  internalNotes: string | null;
};
type Area = { id: string; name: string; areaType: string };

export function BatchTimeline({ batchId, activities, beds }: { batchId: string; activities: Activity[]; beds: Area[] }) {
  const router = useRouter();
  const [movingActivityId, setMovingActivityId] = useState<string | null>(null);
  const [targetAreaId, setTargetAreaId] = useState(beds[0]?.id ?? "");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleComplete(activity: Activity) {
    if (activity.activityType === "TRANSPLANT") {
      setMovingActivityId(activity.id);
      return;
    }
    setBusyId(activity.id);
    await completeActivity(activity.id);
    setBusyId(null);
    router.refresh();
  }

  async function handleConfirmMove(activityId: string) {
    setBusyId(activityId);
    await moveBatch({ batchId, areaId: targetAreaId }, activityId);
    setMovingActivityId(null);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="rounded-lg border border-stone-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-stone-900">{activity.internalNotes ?? activity.activityType}</span>
              {activity.plannedDateTime && (
                <span className="ml-2 text-sm text-stone-500">
                  planned {new Date(activity.plannedDateTime).toLocaleDateString()}
                </span>
              )}
            </div>
            {activity.status === "DONE" ? (
              <span className="text-sm text-green-700">
                Done {activity.actualEndDateTime && new Date(activity.actualEndDateTime).toLocaleDateString()}
              </span>
            ) : (
              <button
                onClick={() => handleComplete(activity)}
                disabled={busyId === activity.id}
                className="h-9 rounded-lg bg-green-700 px-3 text-sm font-medium text-white active:bg-green-800 disabled:opacity-60"
              >
                Complete
              </button>
            )}
          </div>

          {movingActivityId === activity.id && (
            <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3">
              <select value={targetAreaId} onChange={(e) => setTargetAreaId(e.target.value)} className="h-10 flex-1 rounded-lg border border-stone-300 px-3 text-sm">
                {beds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleConfirmMove(activity.id)}
                disabled={busyId === activity.id}
                className="h-10 rounded-lg bg-green-700 px-3 text-sm font-medium text-white disabled:opacity-60"
              >
                Move & complete
              </button>
            </div>
          )}
        </div>
      ))}
      {activities.length === 0 && <p className="text-sm text-stone-500">No activities yet.</p>}
    </div>
  );
}
