"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { workflowTemplateSchema, workflowTaskSchema, type WorkflowTemplateInput, type WorkflowTaskInput } from "@/schemas/workflow";

export async function getProfileWithWorkflow(profileId: string) {
  const farmId = await getCurrentFarmId();
  return db.productionProfile.findFirstOrThrow({
    where: { id: profileId, varietyBreed: { species: { farmId } } },
    include: {
      varietyBreed: { include: { species: true } },
      method: true,
      workflowTemplates: { include: { taskTemplates: { orderBy: { sequence: "asc" } } } },
    },
  });
}

export async function createWorkflowTemplate(profileId: string, input: WorkflowTemplateInput) {
  const data = workflowTemplateSchema.parse(input);

  const template = await db.workflowTemplate.create({
    data: { profileId, name: data.name, anchorType: data.anchorType, schedulingDirection: "FORWARD" },
  });

  revalidatePath(`/admin/species/${profileId}`);
  revalidatePath("/admin/species");
  return template;
}

export async function addWorkflowTask(workflowTemplateId: string, profileId: string, input: WorkflowTaskInput) {
  const data = workflowTaskSchema.parse(input);

  const count = await db.workflowTaskTemplate.count({ where: { workflowTemplateId } });
  const task = await db.workflowTaskTemplate.create({
    data: {
      workflowTemplateId,
      taskType: data.taskType,
      taskName: data.taskName,
      offsetFromAnchorDays: data.offsetFromAnchorDays,
      sequence: count + 1,
    },
  });

  revalidatePath(`/admin/species/${profileId}`);
  revalidatePath("/admin/species");
  return task;
}

export async function deleteWorkflowTask(id: string, profileId: string) {
  await db.workflowTaskTemplate.delete({ where: { id } });
  revalidatePath(`/admin/species/${profileId}`);
  revalidatePath("/admin/species");
}
