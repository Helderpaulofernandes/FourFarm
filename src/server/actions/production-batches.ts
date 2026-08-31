"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import {
  createBatchSchema,
  moveBatchSchema,
  logActivitySchema,
  logHarvestSchema,
  type CreateBatchInput,
  type MoveBatchInput,
  type LogActivityInput,
  type LogHarvestInput,
} from "@/schemas/production-batch";

export async function listBatches() {
  const farmId = await getCurrentFarmId();
  return db.productionBatch.findMany({
    where: { farmId },
    include: {
      varietyBreed: { include: { species: true } },
      locations: { where: { endDateTime: null }, include: { area: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatch(id: string) {
  const farmId = await getCurrentFarmId();
  return db.productionBatch.findFirstOrThrow({
    where: { id, farmId },
    include: {
      varietyBreed: { include: { species: true } },
      profile: { include: { cropProfile: true, poultryProfile: true } },
      workflowTemplate: true,
      locations: { orderBy: { startDateTime: "asc" }, include: { area: true } },
      activities: { orderBy: { plannedDateTime: "asc" }, include: { inputs: { include: { inventoryLot: { include: { item: true } } } } } },
      observations: { orderBy: { observedAt: "desc" } },
      harvests: { orderBy: { harvestDateTime: "desc" } },
    },
  });
}

const BATCH_CODE_PREFIX: Record<string, string> = {
  MARKET_GARDEN: "MG",
  NURSERY: "NU",
  FOREST: "FO",
  LAYERS: "LF",
  BROILERS: "BR",
};

function nextBatchCode(enterpriseType: string, existingCount: number) {
  const prefix = BATCH_CODE_PREFIX[enterpriseType] ?? enterpriseType.slice(0, 2);
  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`;
}

export async function createBatch(input: CreateBatchInput) {
  const data = createBatchSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const [varietyBreed, profile, area, batchCount] = await Promise.all([
    db.varietyBreed.findUniqueOrThrow({ where: { id: data.varietyBreedId } }),
    db.productionProfile.findUniqueOrThrow({
      where: { id: data.profileId },
      include: { workflowTemplates: { include: { taskTemplates: true } }, method: true },
    }),
    db.productionArea.findFirstOrThrow({ where: { id: data.areaId, farmId } }),
    db.productionBatch.count({ where: { farmId } }),
  ]);

  const workflowTemplate = data.workflowTemplateId
    ? profile.workflowTemplates.find((w) => w.id === data.workflowTemplateId)
    : profile.workflowTemplates[0];

  const enterpriseType = profile.method.productionSystem;

  const batch = await db.productionBatch.create({
    data: {
      farmId,
      batchCode: nextBatchCode(enterpriseType, batchCount),
      enterpriseType,
      varietyBreedId: varietyBreed.id,
      profileId: profile.id,
      profileVersion: profile.version,
      workflowTemplateId: workflowTemplate?.id,
      plannedStartDate: data.startedAt,
      actualStartDate: data.startedAt,
      initialQuantity: data.initialQuantity,
      currentQuantity: data.initialQuantity,
      quantityUnit: data.quantityUnit,
      status: profile.nurseryRequired ? "SEEDED" : "GROWING",
      locations: {
        create: {
          areaId: area.id,
          startDateTime: data.startedAt,
          quantity: data.initialQuantity,
          unit: data.quantityUnit,
          placementType: enterpriseType === "LAYERS" || enterpriseType === "BROILERS" ? "PLACED" : "SOWN",
        },
      },
    },
  });

  if (workflowTemplate) {
    await db.activity.createMany({
      data: workflowTemplate.taskTemplates.map((task) => ({
        farmId,
        batchId: batch.id,
        taskTemplateId: task.id,
        activityType: task.taskType,
        plannedDateTime:
          task.offsetFromAnchorDays != null
            ? new Date(data.startedAt.getTime() + task.offsetFromAnchorDays * 86_400_000)
            : null,
        internalNotes: task.taskName,
        status: "PLANNED",
      })),
    });
  }

  revalidatePath("/admin/batches");
  return batch;
}

export async function updateActivityPlannedDate(activityId: string, plannedDateTime: Date) {
  const activity = await db.activity.update({
    where: { id: activityId },
    data: { plannedDateTime },
  });
  if (activity.batchId) revalidatePath(`/admin/batches/${activity.batchId}`);
  return activity;
}

export async function completeActivity(activityId: string) {
  const activity = await db.activity.update({
    where: { id: activityId },
    data: { status: "DONE", actualStartDateTime: new Date(), actualEndDateTime: new Date() },
  });

  if (activity.batchId) {
    revalidatePath(`/admin/batches/${activity.batchId}`);
  }
  return activity;
}

export async function moveBatch(input: MoveBatchInput, activityId?: string) {
  const data = moveBatchSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const batch = await db.productionBatch.findFirstOrThrow({
    where: { id: data.batchId, farmId },
    include: { locations: { where: { endDateTime: null } } },
  });
  const currentLocation = batch.locations[0];

  // A plant's first move out of the nursery is a "transplant" and flips the
  // batch into TRANSPLANTED status; a flock rotating between paddocks is just
  // a MOVED placement that doesn't change the batch's lifecycle status.
  const isTransplant = batch.enterpriseType !== "LAYERS" && batch.enterpriseType !== "BROILERS" && batch.status !== "TRANSPLANTED";
  const placementType = isTransplant ? "TRANSPLANTED" : "MOVED";

  await db.$transaction([
    ...(currentLocation
      ? [
          db.batchLocation.update({
            where: { id: currentLocation.id },
            data: { endDateTime: new Date() },
          }),
        ]
      : []),
    db.batchLocation.create({
      data: {
        batchId: batch.id,
        areaId: data.areaId,
        startDateTime: new Date(),
        quantity: data.quantity ?? batch.currentQuantity ?? undefined,
        unit: batch.quantityUnit ?? undefined,
        placementType,
        activityId,
      },
    }),
    ...(isTransplant
      ? [db.productionBatch.update({ where: { id: batch.id }, data: { status: "TRANSPLANTED" as const } })]
      : []),
    ...(activityId
      ? [
          db.activity.update({
            where: { id: activityId },
            data: { status: "DONE", actualStartDateTime: new Date(), actualEndDateTime: new Date() },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/admin/batches/${batch.id}`);
  revalidatePath("/admin/areas");
}

export async function logActivity(input: LogActivityInput) {
  const data = logActivitySchema.parse(input);
  const farmId = await getCurrentFarmId();

  const [activity] = await db.$transaction([
    db.activity.create({
      data: {
        farmId,
        batchId: data.batchId,
        activityType: data.activityType,
        status: "DONE",
        actualStartDateTime: new Date(),
        actualEndDateTime: new Date(),
        internalNotes: data.notes,
        quantity: data.quantity,
      },
    }),
    ...(data.activityType === "MORTALITY" && data.quantity
      ? [
          db.productionBatch.update({
            where: { id: data.batchId },
            data: { currentQuantity: { decrement: data.quantity } },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/admin/batches/${data.batchId}`);
  return activity;
}

export async function logHarvest(input: LogHarvestInput) {
  const data = logHarvestSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const batch = await db.productionBatch.findFirstOrThrow({ where: { id: data.batchId, farmId } });

  const [harvest] = await db.$transaction([
    db.harvest.create({
      data: {
        batchId: batch.id,
        harvestLotCode: `H-${batch.batchCode}-${Date.now().toString(36).toUpperCase()}`,
        grossQuantity: data.grossQuantity,
        marketableQuantity: data.grossQuantity,
        unit: data.unit,
        qualityGrade: data.qualityGrade,
      },
    }),
    db.productionBatch.update({ where: { id: batch.id }, data: { status: "HARVESTING" } }),
  ]);

  revalidatePath(`/admin/batches/${batch.id}`);
  return harvest;
}

export async function completeBatch(batchId: string) {
  const farmId = await getCurrentFarmId();
  await db.$transaction([
    db.batchLocation.updateMany({
      where: { batchId, endDateTime: null },
      data: { endDateTime: new Date() },
    }),
    db.productionBatch.updateMany({
      where: { id: batchId, farmId },
      data: { status: "COMPLETED", actualCompletionDate: new Date() },
    }),
  ]);
  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath("/admin/areas");
}
