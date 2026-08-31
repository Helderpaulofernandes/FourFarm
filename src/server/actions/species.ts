"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { speciesSchema, varietyBreedSchema, cropProfileSchema, type SpeciesInput, type VarietyBreedInput, type CropProfileInput } from "@/schemas/species";

export async function listSpecies() {
  const farmId = await getCurrentFarmId();
  return db.species.findMany({
    where: { farmId },
    include: {
      varieties: {
        include: {
          profiles: { include: { cropProfile: true, method: true, workflowTemplates: true } },
        },
      },
    },
    orderBy: { commonName: "asc" },
  });
}

export async function listVarietyBreeds() {
  const farmId = await getCurrentFarmId();
  return db.varietyBreed.findMany({
    where: { species: { farmId } },
    include: {
      species: true,
      profiles: { where: { active: true }, include: { workflowTemplates: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function listProductionMethods() {
  const farmId = await getCurrentFarmId();
  return db.productionMethod.findMany({ where: { farmId }, orderBy: { name: "asc" } });
}

export async function createSpecies(input: SpeciesInput) {
  const data = speciesSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const species = await db.species.create({ data: { farmId, ...data } });
  revalidatePath("/admin/species");
  return species;
}

export async function createVarietyBreed(input: VarietyBreedInput) {
  const data = varietyBreedSchema.parse(input);
  const variety = await db.varietyBreed.create({ data });
  revalidatePath("/admin/species");
  return variety;
}

export async function createCropProfile(input: CropProfileInput) {
  const data = cropProfileSchema.parse(input);

  const profile = await db.productionProfile.create({
    data: {
      varietyBreedId: data.varietyBreedId,
      methodId: data.methodId,
      name: data.name,
      nurseryRequired: data.nurseryRequired,
      targetNurseryDays: data.targetNurseryDays,
      targetHarvestStartDays: data.targetHarvestStartDays,
      targetHarvestWindowDays: data.targetHarvestWindowDays,
      cropProfile: {
        create: {
          plantSpacingMm: data.plantSpacingMm,
          rowSpacingMm: data.rowSpacingMm,
          daysToGerminationTypical: data.daysToGerminationTypical,
          hardeningDays: data.hardeningDays,
          daysInNursery: data.targetNurseryDays,
          targetTransplantAgeDays: data.targetNurseryDays,
          daysToFirstHarvest: data.targetHarvestStartDays,
          harvestWindowDays: data.targetHarvestWindowDays,
        },
      },
    },
  });

  revalidatePath("/admin/species");
  return profile;
}
