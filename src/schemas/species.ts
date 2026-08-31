import { z } from "zod";
import { optionalPositiveInt, optionalPositiveNumber } from "@/lib/zod-helpers";

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
  // An HTML <select>'s empty placeholder option submits "" — z.enum().optional()
  // only accepts undefined, so without this preprocess step, leaving rotation
  // group unset silently fails validation and the form appears to do nothing.
  rotationGroup: z.preprocess((v) => (v === "" ? undefined : v), z.enum(rotationGroups).optional()),
  publicDescription: z.string().optional(),
});
export type VarietyBreedInput = z.infer<typeof varietyBreedSchema>;

export const cropProfileSchema = z.object({
  varietyBreedId: z.string().min(1, "Required"),
  methodId: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  nurseryRequired: z.boolean().default(true),
  targetNurseryDays: optionalPositiveInt(),
  targetHarvestStartDays: z.coerce.number().int().positive(),
  targetHarvestWindowDays: optionalPositiveInt(),
  plantSpacingMm: z.coerce.number().int().positive(),
  rowSpacingMm: z.coerce.number().int().positive(),
  daysToGerminationTypical: optionalPositiveInt(),
  hardeningDays: optionalPositiveInt(),
});
export type CropProfileInput = z.infer<typeof cropProfileSchema>;

export const flockTypes = ["LAYER", "BROILER"] as const;

export const poultryProfileSchema = z.object({
  varietyBreedId: z.string().min(1, "Required"),
  methodId: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  flockType: z.enum(flockTypes),
  breedName: z.string().optional(),
  broodingDays: optionalPositiveInt(),
  growOutDays: optionalPositiveInt(),
  targetStockingDensity: optionalPositiveNumber(),
  expectedFeedConsumptionPerBirdDay: optionalPositiveNumber(),
  expectedEggsPerHenWeek: optionalPositiveNumber(),
  expectedLiveWeightKg: optionalPositiveNumber(),
  targetProcessingAgeDays: optionalPositiveInt(),
});
export type PoultryProfileInput = z.infer<typeof poultryProfileSchema>;

export const canopyStrata = ["EMERGENT", "HIGH", "MEDIUM", "LOW", "SHRUB", "GROUND_COVER", "CLIMBER"] as const;
export const successionalStages = ["PLACENTA", "SECONDARY", "CLIMAX"] as const;

export const treeProfileSchema = z.object({
  varietyBreedId: z.string().min(1, "Required"),
  methodId: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  canopyStratum: z.enum(canopyStrata),
  successionalStage: z.enum(successionalStages),
  matureHeightM: optionalPositiveNumber(),
  matureSpreadM: optionalPositiveNumber(),
  withinRowSpacingM: optionalPositiveNumber(),
  betweenRowSpacingM: optionalPositiveNumber(),
  yearsToFirstYield: optionalPositiveNumber(),
  nitrogenFixer: z.boolean().default(false),
  chopAndDropCandidate: z.boolean().default(false),
  pruningFrequencyMonths: optionalPositiveInt(),
});
export type TreeProfileInput = z.infer<typeof treeProfileSchema>;
