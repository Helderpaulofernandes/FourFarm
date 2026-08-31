"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addWorkflowTask } from "@/server/actions/workflows";
import { activityTypes } from "@/schemas/production-batch";

export function WorkflowTaskForm({ workflowTemplateId, profileId }: { workflowTemplateId: string; profileId: string }) {
  const router = useRouter();
  const [taskType, setTaskType] = useState<(typeof activityTypes)[number]>("SOW");
  const [taskName, setTaskName] = useState("");
  const [offsetFromAnchorDays, setOffsetFromAnchorDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName || offsetFromAnchorDays === "") return;
    setSubmitting(true);
    await addWorkflowTask(workflowTemplateId, profileId, {
      taskType,
      taskName,
      offsetFromAnchorDays: Number(offsetFromAnchorDays),
    });
    setTaskName("");
    setOffsetFromAnchorDays("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Task type</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as (typeof activityTypes)[number])}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          >
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Task name</label>
          <input value={taskName} onChange={(e) => setTaskName(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Offset days from anchor</label>
          <input
            type="number"
            min={0}
            value={offsetFromAnchorDays}
            onChange={(e) => setOffsetFromAnchorDays(e.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {submitting ? "Adding..." : "+ Add task"}
      </button>
    </form>
  );
}
