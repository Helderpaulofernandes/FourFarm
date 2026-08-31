import { z } from "zod";

export const areaTypes = ["BED", "NURSERY_BENCH", "TRACTOR", "FOREST_ROW", "COOP", "PADDOCK"] as const;

export const productionAreaSchema = z.object({
  areaType: z.enum(areaTypes),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  gridX: z.coerce.number().int().optional(),
  gridY: z.coerce.number().int().optional(),
  lengthM: z.coerce.number().positive().optional(),
  widthM: z.coerce.number().positive().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  capacityUnit: z.string().optional(),
});
export type ProductionAreaInput = z.infer<typeof productionAreaSchema>;
