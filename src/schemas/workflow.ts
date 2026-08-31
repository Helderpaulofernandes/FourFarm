import { z } from "zod";
import { activityTypes } from "@/schemas/production-batch";

export const anchorTypes = ["SEED_DATE", "TARGET_HARVEST", "HATCH_DATE"] as const;

export const workflowTemplateSchema = z.object({
  name: z.string().min(1, "Required"),
  anchorType: z.enum(anchorTypes),
});
export type WorkflowTemplateInput = z.infer<typeof workflowTemplateSchema>;

export const workflowTaskSchema = z.object({
  taskType: z.enum(activityTypes),
  taskName: z.string().min(1, "Required"),
  offsetFromAnchorDays: z.coerce.number().int().min(0),
});
export type WorkflowTaskInput = z.infer<typeof workflowTaskSchema>;
