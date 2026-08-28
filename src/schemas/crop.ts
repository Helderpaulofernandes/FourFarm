import { z } from "zod";

export const propagationMethods = ["DIRECT_SEED", "TRANSPLANT", "BOTH"] as const;
export const seasons = ["WET", "DRY"] as const;

export const cropSchema = z.object({
  name: z.string().min(1, "Required"),
  variety: z.string().optional(),
  propagationMethod: z.enum(propagationMethods),
  daysToMaturityMin: z.coerce.number().int().positive(),
  daysToMaturityMax: z.coerce.number().int().positive(),
  spacingCm: z.coerce.number().int().positive(),
  protectionMethodIds: z.array(z.string()).optional(),
  wetMultiplier: z.coerce.number().positive().default(1),
  dryMultiplier: z.coerce.number().positive().default(1),
});

export type CropInput = z.infer<typeof cropSchema>;
