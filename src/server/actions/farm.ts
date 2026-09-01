"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { farmSettingsSchema, type FarmSettingsInput } from "@/schemas/farm";

export async function getFarmSettings() {
  const farmId = await getCurrentFarmId();
  return db.farm.findUniqueOrThrow({
    where: { id: farmId },
    select: { name: true, climateZone: true, publicStory: true, heroImageUrl: true },
  });
}

export async function updateFarmSettings(input: FarmSettingsInput) {
  const data = farmSettingsSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const farm = await db.farm.update({ where: { id: farmId }, data });
  revalidatePath("/admin/farm");
  revalidatePath("/transparency");
  return farm;
}
