"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { cropSchema, type CropInput } from "@/schemas/crop";

export async function listCrops() {
  const farmId = await getCurrentFarmId();
  return db.crop.findMany({
    where: { farmId },
    include: { protectionMethods: { include: { protectionMethod: true } }, seasonalMultipliers: true },
    orderBy: { name: "asc" },
  });
}

export async function listProtectionMethods() {
  const farmId = await getCurrentFarmId();
  return db.protectionMethod.findMany({ where: { farmId }, orderBy: { name: "asc" } });
}

export async function createCrop(input: CropInput) {
  const data = cropSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const crop = await db.crop.create({
    data: {
      farmId,
      name: data.name,
      variety: data.variety || null,
      propagationMethod: data.propagationMethod,
      daysToMaturityMin: data.daysToMaturityMin,
      daysToMaturityMax: data.daysToMaturityMax,
      spacingCm: data.spacingCm,
      seasonalMultipliers: {
        create: [
          { season: "WET", multiplier: data.wetMultiplier },
          { season: "DRY", multiplier: data.dryMultiplier },
        ],
      },
      protectionMethods: data.protectionMethodIds?.length
        ? {
            create: data.protectionMethodIds.map((protectionMethodId) => ({
              protectionMethodId,
              season: null,
            })),
          }
        : undefined,
    },
  });

  revalidatePath("/admin/crops");
  return crop;
}
