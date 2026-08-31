"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeActivity, moveBatch, updateActivityPlannedDate } from "@/server/actions/production-batches";

type Activity = {
  id: string;
  activityType: string;
  status: string;
  plannedDateTime: Date | string | null;
  actualEndDateTime: Date | string | null;
  internalNotes: string | null;
  taskTemplateId: string | null;
};
type Area = { id: string; name: string; areaType: string };

function toDateInputValue(d: Date | string | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

// Only the tasks generated from the batch's workflow template (taskTemplateId
// set) belong in the planner — ad-hoc logged activities show in the log panel
// instead, so the planner stays a clean sow-to-harvest timeline.
export function BatchTimeline({ batchId, activities, beds }: { batchId: string; activities: Activity[]; beds: Area[] }) {
  const router = useRouter();
  const [movingActivityId, setMovingActivityId] = useState<string | null>(null);
  const [targetAreaId, setTargetAreaId] = useState(beds[0]?.id ?? "");
  const [busyId, setBusyId] = useState<string | null>(null);

  const plannedTasks = activities.filter((a) => a.taskTemplateId);

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

  async function handleDateChange(activityId: string, value: string) {
    if (!value) return;
    await updateActivityPlannedDate(activityId, new Date(value));
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2" style={{ minWidth: plannedTasks.length * 140 }}>
        {plannedTasks.map((activity, i) => (
          <div key={activity.id} className="relative flex-1">
            {i > 0 && <div className="absolute left-[-12px] top-6 h-px w-3 bg-stone-300" />}
            <div className={`rounded-lg border p-3 ${activity.status === "DONE" ? "border-green-300 bg-green-50" : "border-stone-200 bg-white"}`}>
              <div className="text-sm font-medium text-stone-900">{activity.internalNotes ?? activity.activityType}</div>
              <input
                type="date"
                defaultValue={toDateInputValue(activity.plannedDateTime)}
                onChange={(e) => handleDateChange(activity.id, e.target.value)}
                className="mt-1 h-8 w-full rounded border border-stone-200 bg-transparent px-1 text-xs text-stone-600"
                disabled={activity.status === "DONE"}
              />
              {activity.status === "DONE" ? (
                <div className="mt-2 text-xs font-medium text-green-700">
                  Done {activity.actualEndDateTime && new Date(activity.actualEndDateTime).toLocaleDateString()}
                </div>
              ) : (
                <button
                  onClick={() => handleComplete(activity)}
                  disabled={busyId === activity.id}
                  className="mt-2 h-8 w-full rounded-lg bg-green-700 text-xs font-medium text-white active:bg-green-800 disabled:opacity-60"
                >
                  Complete
                </button>
              )}

              {movingActivityId === activity.id && (
                <div className="mt-2 space-y-1 border-t border-stone-100 pt-2">
                  <select value={targetAreaId} onChange={(e) => setTargetAreaId(e.target.value)} className="h-8 w-full rounded border border-stone-300 px-1 text-xs">
                    {beds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleConfirmMove(activity.id)}
                    disabled={busyId === activity.id}
                    className="h-8 w-full rounded bg-green-700 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Move & complete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {plannedTasks.length === 0 && <p className="text-sm text-stone-500">No planned tasks — this batch has no workflow template.</p>}
      </div>
    </div>
  );
}
