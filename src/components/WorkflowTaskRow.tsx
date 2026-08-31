"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkflowTask } from "@/server/actions/workflows";

type Task = { id: string; sequence: number; taskName: string; taskType: string; offsetFromAnchorDays: number | null };

export function WorkflowTaskRow({ task, profileId }: { task: Task; profileId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${task.taskName}" from this workflow?`)) return;
    setDeleting(true);
    await deleteWorkflowTask(task.id, profileId);
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
      <div className="text-sm">
        <span className="font-medium text-stone-500">#{task.sequence}</span>{" "}
        <span className="font-medium text-stone-900">{task.taskName}</span>{" "}
        <span className="text-stone-500">({task.taskType.replace(/_/g, " ").toLowerCase()})</span>
        <span className="ml-2 text-stone-500">Day {task.offsetFromAnchorDays}</span>
      </div>
      <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-red-600 disabled:opacity-60">
        Remove
      </button>
    </div>
  );
}
