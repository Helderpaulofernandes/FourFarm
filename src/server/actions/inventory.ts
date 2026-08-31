"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import {
  itemSchema,
  inventoryLotSchema,
  logActivityInputSchema,
  type ItemInput,
  type InventoryLotInput,
  type LogActivityInputInput,
} from "@/schemas/inventory";

export async function listItems() {
  const farmId = await getCurrentFarmId();
  return db.item.findMany({
    where: { farmId },
    include: { lots: { orderBy: { purchaseDate: "desc" } } },
    orderBy: { name: "asc" },
  });
}

export async function listAvailableLots() {
  const farmId = await getCurrentFarmId();
  return db.inventoryLot.findMany({
    where: { item: { farmId }, status: "AVAILABLE", quantityRemaining: { gt: 0 } },
    include: { item: true },
    orderBy: { item: { name: "asc" } },
  });
}

export async function createItem(input: ItemInput) {
  const data = itemSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const item = await db.item.create({ data: { farmId, ...data } });
  revalidatePath("/admin/inventory");
  return item;
}

export async function createInventoryLot(input: InventoryLotInput) {
  const data = inventoryLotSchema.parse(input);

  const lot = await db.inventoryLot.create({
    data: { ...data, quantityRemaining: data.quantityReceived },
  });

  revalidatePath("/admin/inventory");
  return lot;
}

export async function logActivityInput(input: LogActivityInputInput, growingActivityType: "FERTILIZE" | "FEED" | "MULCH" = "FERTILIZE") {
  const data = logActivityInputSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const lot = await db.inventoryLot.findUniqueOrThrow({ where: { id: data.inventoryLotId } });

  const [activity] = await db.$transaction([
    db.activity.create({
      data: {
        farmId,
        batchId: data.batchId,
        activityType: growingActivityType,
        status: "DONE",
        actualStartDateTime: new Date(),
        actualEndDateTime: new Date(),
        inputs: {
          create: {
            inventoryLotId: lot.id,
            quantity: data.quantity,
            unit: lot.unit,
            costSnapshot: lot.unitCost ? lot.unitCost * data.quantity : null,
          },
        },
      },
    }),
    db.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: data.quantity } },
    }),
  ]);

  revalidatePath(`/admin/batches/${data.batchId}`);
  return activity;
}
