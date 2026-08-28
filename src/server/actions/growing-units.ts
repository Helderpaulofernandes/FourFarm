"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import {
  growingUnitSchema,
  startOccupancySchema,
  lifecycleEventSchema,
  type GrowingUnitInput,
  type StartOccupancyInput,
  type LifecycleEventInput,
} from "@/schemas/growing-unit";

export async function listGrowingUnits() {
  const farmId = await getCurrentFarmId();
  return db.growingUnit.findMany({
    where: { farmId },
    include: {
      occupancies: {
        where: { status: "ACTIVE" },
        include: { cropPlanting: { include: { crop: true } } },
      },
    },
    orderBy: [{ unitType: "asc" }, { gridX: "asc" }, { gridY: "asc" }],
  });
}

export async function getGrowingUnit(id: string) {
  const farmId = await getCurrentFarmId();
  return db.growingUnit.findFirstOrThrow({
    where: { id, farmId },
    include: {
      occupancies: {
        orderBy: { startedAt: "desc" },
        include: {
          cropPlanting: { include: { crop: true } },
          events: { orderBy: { occurredAt: "desc" } },
          inputApplications: { include: { inputMaterial: true }, orderBy: { appliedAt: "desc" } },
        },
      },
    },
  });
}

export async function createGrowingUnit(input: GrowingUnitInput) {
  const data = growingUnitSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const unit = await db.growingUnit.create({
    data: { farmId, ...data },
  });

  revalidatePath("/admin/growing-units");
  return unit;
}

export async function startOccupancy(input: StartOccupancyInput) {
  const data = startOccupancySchema.parse(input);

  const existingActive = await db.occupancy.findFirst({
    where: { growingUnitId: data.growingUnitId, status: "ACTIVE" },
  });
  if (existingActive) {
    throw new Error("This growing unit already has an active occupancy.");
  }

  const priorCount = await db.occupancy.count({ where: { growingUnitId: data.growingUnitId } });

  const occupancy = await db.occupancy.create({
    data: {
      growingUnitId: data.growingUnitId,
      occupantType: data.occupantType,
      startedAt: data.startedAt,
      successionNo: priorCount + 1,
      cropPlanting:
        data.occupantType === "CROP_PLANTING" && data.cropId
          ? {
              create: {
                cropId: data.cropId,
                propagationMethod: (
                  await db.crop.findUniqueOrThrow({ where: { id: data.cropId } })
                ).propagationMethod,
                sownAt: data.startedAt,
              },
            }
          : undefined,
    },
  });

  await db.growingUnit.update({
    where: { id: data.growingUnitId },
    data: { status: "OCCUPIED" },
  });

  revalidatePath(`/admin/growing-units/${data.growingUnitId}`);
  revalidatePath("/admin/growing-units");
  return occupancy;
}

export async function endOccupancy(occupancyId: string, growingUnitId: string) {
  await db.occupancy.update({
    where: { id: occupancyId },
    data: { status: "COMPLETED", endedAt: new Date() },
  });
  await db.growingUnit.update({
    where: { id: growingUnitId },
    data: { status: "AVAILABLE" },
  });

  revalidatePath(`/admin/growing-units/${growingUnitId}`);
  revalidatePath("/admin/growing-units");
}

export async function logLifecycleEvent(input: LifecycleEventInput, growingUnitId: string) {
  const data = lifecycleEventSchema.parse(input);
  const event = await db.lifecycleEvent.create({ data });

  revalidatePath(`/admin/growing-units/${growingUnitId}`);
  return event;
}
