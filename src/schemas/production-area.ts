import { z } from "zod";
import { optionalInt, optionalPositiveInt, optionalPositiveNumber } from "@/lib/zod-helpers";

export const areaTypes = ["BED", "NURSERY_BENCH", "TRACTOR", "FOREST_ROW", "COOP", "PADDOCK"] as const;

export const productionAreaSchema = z.object({
  areaType: z.enum(areaTypes),
  code: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  gridX: optionalInt(),
  gridY: optionalInt(),
  lengthM: optionalPositiveNumber(),
  widthM: optionalPositiveNumber(),
  capacity: optionalPositiveInt(),
  capacityUnit: z.string().optional(),
});
export type ProductionAreaInput = z.infer<typeof productionAreaSchema>;
