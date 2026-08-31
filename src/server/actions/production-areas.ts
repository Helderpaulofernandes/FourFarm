"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { productionAreaSchema, type ProductionAreaInput } from "@/schemas/production-area";

export async function listProductionAreas() {
  const farmId = await getCurrentFarmId();
  return db.productionArea.findMany({
    where: { farmId },
    include: {
      batchLocations: {
        where: { endDateTime: null },
        include: { batch: { include: { varietyBreed: true } } },
      },
    },
    orderBy: [{ areaType: "asc" }, { gridX: "asc" }, { gridY: "asc" }],
  });
}

export async function getProductionArea(id: string) {
  const farmId = await getCurrentFarmId();
  return db.productionArea.findFirstOrThrow({
    where: { id, farmId },
    include: {
      batchLocations: {
        orderBy: { startDateTime: "desc" },
        include: { batch: { include: { varietyBreed: true } } },
      },
    },
  });
}

export async function createProductionArea(input: ProductionAreaInput) {
  const data = productionAreaSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const area = await db.productionArea.create({ data: { farmId, ...data } });
  revalidatePath("/admin/areas");
  return area;
}

export async function updateProductionArea(id: string, input: ProductionAreaInput) {
  const data = productionAreaSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const area = await db.productionArea.update({ where: { id, farmId }, data });
  revalidatePath("/admin/areas");
  return area;
}
