"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import {
  speciesSchema,
  varietyBreedSchema,
  cropProfileSchema,
  poultryProfileSchema,
  type SpeciesInput,
  type VarietyBreedInput,
  type CropProfileInput,
  type PoultryProfileInput,
} from "@/schemas/species";

export async function listSpecies() {
  const farmId = await getCurrentFarmId();
  return db.species.findMany({
    where: { farmId },
    include: {
      varieties: {
        include: {
          profiles: { include: { cropProfile: true, poultryProfile: true, method: true, workflowTemplates: true } },
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
      profiles: { where: { active: true }, include: { workflowTemplates: true, method: true } },
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

export async function updateSpecies(id: string, input: SpeciesInput) {
  const data = speciesSchema.parse(input);
  const species = await db.species.update({ where: { id }, data });
  revalidatePath("/admin/species");
  return species;
}

export async function createVarietyBreed(input: VarietyBreedInput) {
  const data = varietyBreedSchema.parse(input);
  const variety = await db.varietyBreed.create({ data });
  revalidatePath("/admin/species");
  return variety;
}

export async function updateVarietyBreed(id: string, input: VarietyBreedInput) {
  const data = varietyBreedSchema.parse(input);
  const variety = await db.varietyBreed.update({ where: { id }, data });
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

export async function createPoultryProfile(input: PoultryProfileInput) {
  const data = poultryProfileSchema.parse(input);

  const profile = await db.productionProfile.create({
    data: {
      varietyBreedId: data.varietyBreedId,
      methodId: data.methodId,
      name: data.name,
      expectedYieldValue: data.expectedLiveWeightKg,
      expectedYieldUnit: data.flockType === "LAYER" ? "eggs/hen/week" : "kg live weight",
      poultryProfile: {
        create: {
          flockType: data.flockType,
          breedName: data.breedName,
          broodingDays: data.broodingDays,
          growOutDays: data.growOutDays,
          targetStockingDensity: data.targetStockingDensity,
          expectedFeedConsumptionPerBirdDay: data.expectedFeedConsumptionPerBirdDay,
          expectedEggsPerHenWeek: data.expectedEggsPerHenWeek,
          expectedLiveWeightKg: data.expectedLiveWeightKg,
          targetProcessingAgeDays: data.targetProcessingAgeDays,
        },
      },
    },
  });

  revalidatePath("/admin/species");
  return profile;
}

export async function updatePoultryProfile(profileId: string, input: PoultryProfileInput) {
  const data = poultryProfileSchema.parse(input);

  const profile = await db.productionProfile.update({
    where: { id: profileId },
    data: {
      name: data.name,
      expectedYieldValue: data.expectedLiveWeightKg,
      poultryProfile: {
        update: {
          flockType: data.flockType,
          breedName: data.breedName,
          broodingDays: data.broodingDays,
          growOutDays: data.growOutDays,
          targetStockingDensity: data.targetStockingDensity,
          expectedFeedConsumptionPerBirdDay: data.expectedFeedConsumptionPerBirdDay,
          expectedEggsPerHenWeek: data.expectedEggsPerHenWeek,
          expectedLiveWeightKg: data.expectedLiveWeightKg,
          targetProcessingAgeDays: data.targetProcessingAgeDays,
        },
      },
    },
  });

  revalidatePath("/admin/species");
  return profile;
}

export async function updateCropProfile(profileId: string, input: CropProfileInput) {
  const data = cropProfileSchema.parse(input);

  const profile = await db.productionProfile.update({
    where: { id: profileId },
    data: {
      name: data.name,
      nurseryRequired: data.nurseryRequired,
      targetNurseryDays: data.targetNurseryDays,
      targetHarvestStartDays: data.targetHarvestStartDays,
      targetHarvestWindowDays: data.targetHarvestWindowDays,
      cropProfile: {
        update: {
          plantSpacingMm: data.plantSpacingMm,
          rowSpacingMm: data.rowSpacingMm,
          daysToGerminationTypical: data.daysToGerminationTypical,
          hardeningDays: data.hardeningDays,
        },
      },
    },
  });

  revalidatePath("/admin/species");
  return profile;
}
