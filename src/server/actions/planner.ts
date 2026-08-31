"use server";

import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";

export async function getAreaOccupancyForYear(year: number) {
  const farmId = await getCurrentFarmId();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  const areas = await db.productionArea.findMany({
    where: { farmId },
    orderBy: [{ areaType: "asc" }, { gridX: "asc" }, { gridY: "asc" }, { code: "asc" }],
    include: {
      batchLocations: {
        where: {
          startDateTime: { lt: yearEnd },
          OR: [{ endDateTime: null }, { endDateTime: { gte: yearStart } }],
        },
        include: { batch: { include: { varietyBreed: true } } },
        orderBy: { startDateTime: "asc" },
      },
    },
  });

  return areas.map((area) => ({
    id: area.id,
    name: area.name,
    areaType: area.areaType,
    spans: area.batchLocations.map((loc) => ({
      batchId: loc.batch.id,
      batchCode: loc.batch.batchCode,
      varietyName: loc.batch.varietyBreed.name,
      start: loc.startDateTime,
      end: loc.endDateTime,
    })),
  }));
}
