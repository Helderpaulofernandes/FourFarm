"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import {
  inputMaterialSchema,
  inputApplicationSchema,
  type InputMaterialInput,
  type InputApplicationInput,
} from "@/schemas/input";

export async function listInputMaterials() {
  const farmId = await getCurrentFarmId();
  return db.inputMaterial.findMany({ where: { farmId }, orderBy: { name: "asc" } });
}

export async function createInputMaterial(input: InputMaterialInput) {
  const data = inputMaterialSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const material = await db.inputMaterial.create({ data: { farmId, ...data } });
  revalidatePath("/admin/inputs");
  return material;
}

export async function logInputApplication(input: InputApplicationInput, growingUnitId: string) {
  const data = inputApplicationSchema.parse(input);

  const material = await db.inputMaterial.findUniqueOrThrow({
    where: { id: data.inputMaterialId },
  });

  const application = await db.inputApplication.create({
    data: {
      occupancyId: data.occupancyId,
      inputMaterialId: data.inputMaterialId,
      quantity: data.quantity,
      costSnapshot: data.quantity * material.costPerUnit,
    },
  });

  revalidatePath(`/admin/growing-units/${growingUnitId}`);
  return application;
}
