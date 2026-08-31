import { z } from "zod";
import { optionalPositiveNumber } from "@/lib/zod-helpers";

export const enterpriseTypes = ["NURSERY", "MARKET_GARDEN", "FOREST", "LAYERS", "BROILERS"] as const;

export const createBatchSchema = z.object({
  varietyBreedId: z.string().min(1),
  profileId: z.string().min(1),
  workflowTemplateId: z.string().optional(),
  areaId: z.string().min(1),
  startedAt: z.coerce.date(),
  initialQuantity: z.coerce.number().positive(),
  quantityUnit: z.string().min(1),
});
export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const moveBatchSchema = z.object({
  batchId: z.string().min(1),
  areaId: z.string().min(1),
  quantity: optionalPositiveNumber(),
});
export type MoveBatchInput = z.infer<typeof moveBatchSchema>;

export const activityTypes = [
  "SOW",
  "GERMINATION_CHECK",
  "POT_UP",
  "HARDEN_OFF",
  "TRANSPLANT",
  "WATER",
  "FERTILIZE",
  "PEST_TREATMENT",
  "WEED",
  "PRUNE",
  "TRELLIS",
  "MULCH",
  "HARVEST",
  "MOVE",
  "FEED",
  "COLLECT_EGGS",
  "MORTALITY",
  "OBSERVATION",
  "OTHER",
] as const;

export const logActivitySchema = z.object({
  batchId: z.string().min(1),
  activityType: z.enum(activityTypes),
  notes: z.string().optional(),
  quantity: optionalPositiveNumber(),
});
export type LogActivityInput = z.infer<typeof logActivitySchema>;

export const logHarvestSchema = z.object({
  batchId: z.string().min(1),
  grossQuantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  qualityGrade: z.string().optional(),
});
export type LogHarvestInput = z.infer<typeof logHarvestSchema>;
