import { z } from "zod";

export const unitTypes = ["BED", "TRACTOR"] as const;

export const growingUnitSchema = z.object({
  unitType: z.enum(unitTypes),
  label: z.string().min(1, "Required"),
  gridX: z.coerce.number().int().optional(),
  gridY: z.coerce.number().int().optional(),
  lengthM: z.coerce.number().positive().optional(),
  widthM: z.coerce.number().positive().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export type GrowingUnitInput = z.infer<typeof growingUnitSchema>;

export const startOccupancySchema = z.object({
  growingUnitId: z.string().min(1),
  occupantType: z.enum(["CROP_PLANTING", "BIRD_BATCH"]),
  cropId: z.string().optional(),
  startedAt: z.coerce.date(),
});

export type StartOccupancyInput = z.infer<typeof startOccupancySchema>;

export const lifecycleEventSchema = z.object({
  occupancyId: z.string().min(1),
  eventType: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

export type LifecycleEventInput = z.infer<typeof lifecycleEventSchema>;
