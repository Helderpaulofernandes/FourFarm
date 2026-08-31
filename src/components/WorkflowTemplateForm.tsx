"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workflowTemplateSchema, type WorkflowTemplateInput } from "@/schemas/workflow";
import { createWorkflowTemplate } from "@/server/actions/workflows";

export function WorkflowTemplateForm({ profileId, defaultName }: { profileId: string; defaultName: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowTemplateInput>({
    resolver: zodResolver(workflowTemplateSchema),
    defaultValues: { name: `${defaultName} workflow`, anchorType: "SEED_DATE" },
  });

  async function onSubmit(data: WorkflowTemplateInput) {
    await createWorkflowTemplate(profileId, data);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm text-stone-500">No workflow yet — create one, then add tasks with their offset days.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input {...register("name")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Anchor</label>
          <select {...register("anchorType")} className="mt-1 h-11 w-full rounded-lg border border-stone-300 px-3">
            <option value="SEED_DATE">Seed / start date</option>
            <option value="TARGET_HARVEST">Target harvest date</option>
            <option value="HATCH_DATE">Hatch date</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg bg-green-700 text-base font-medium text-white active:bg-green-800 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {isSubmitting ? "Creating..." : "Create workflow"}
      </button>
    </form>
  );
}
