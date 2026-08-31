import { z } from "zod";

export const kingdoms = ["PLANT", "ANIMAL", "FUNGI"] as const;
export const rotationGroups = ["ROOT", "ALLIUM", "FRUIT", "LEGUME", "LEAF"] as const;

export const speciesSchema = z.object({
  kingdom: z.enum(kingdoms),
  commonName: z.string().min(1, "Required"),
  scientificName: z.string().optional(),
  family: z.string().optional(),
  primaryRole: z.string().optional(),
});
export type SpeciesInput = z.infer<typeof speciesSchema>;

export const varietyBreedSchema = z.object({
  speciesId: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  rotationGroup: z.enum(rotationGroups).optional(),
  publicDescription: z.string().optional(),
});
export type VarietyBreedInput = z.infer<typeof varietyBreedSchema>;

export const cropProfileSchema = z.object({
  varietyBreedId: z.string().min(1, "Required"),
  methodId: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  nurseryRequired: z.boolean().default(true),
  targetNurseryDays: z.coerce.number().int().positive().optional(),
  targetHarvestStartDays: z.coerce.number().int().positive(),
  targetHarvestWindowDays: z.coerce.number().int().positive().optional(),
  plantSpacingMm: z.coerce.number().int().positive(),
  rowSpacingMm: z.coerce.number().int().positive(),
  daysToGerminationTypical: z.coerce.number().int().positive().optional(),
  hardeningDays: z.coerce.number().int().positive().optional(),
});
export type CropProfileInput = z.infer<typeof cropProfileSchema>;
